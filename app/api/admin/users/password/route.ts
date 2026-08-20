import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type AdminBody = {
  userId?: string;
  employeeId?: string;
  email?: string;
  displayName?: string;
  password?: string;
  role?: string;
  permissions?: Record<string, { view: boolean; edit: boolean }>;
};

function configuration() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

async function verifyAdministrator(url: string, key: string, request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Administrator sign-in is required" }, { status: 401 }) };
  const verifier = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await verifier.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Invalid administrator session" }, { status: 401 }) };
  if (user.app_metadata?.role !== "admin") return { error: NextResponse.json({ error: "Administrator access is required" }, { status: 403 }) };
  return { token, user };
}

async function findUserByEmail(admin: SupabaseClient<any, "public", "public", any, any>, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found || data.users.length < 100) return found;
  }
  return undefined;
}

export async function POST(request: Request) {
  const { url, publishableKey, serviceRoleKey } = configuration();
  if (!url || !publishableKey) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const verification = await verifyAdministrator(url, publishableKey, request);
  if (verification.error) return verification.error;
  const body = (await request.json()) as AdminBody;

  if (!serviceRoleKey) {
    const response = await fetch(`${url}/functions/v1/admin-user-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${verification.token}`, apikey: publishableKey },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({ error: "Employee account service returned an invalid response" }));
    return NextResponse.json(result, { status: response.status });
  }

  const role = ["admin", "user", "other"].includes(body.role || "") ? body.role! : "user";
  const employeeId = body.employeeId?.trim();
  const isProvisioning = Boolean(employeeId);
  const email = body.email?.trim().toLowerCase() || "";
  if (!isProvisioning && !body.userId) return NextResponse.json({ error: "A valid user is required" }, { status: 400 });
  if (body.password !== undefined && body.password.length < 8) return NextResponse.json({ error: "Password must contain at least 8 characters" }, { status: 400 });
  if (isProvisioning && (!email.includes("@") || !body.password)) return NextResponse.json({ error: "A valid employee email and password are required" }, { status: 400 });

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let target: User | undefined;
  let created = false;

  if (isProvisioning) {
    try {
      target = await findUserByEmail(admin, email);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to check existing accounts" }, { status: 500 });
    }
    if (!target) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: body.password!,
        email_confirm: true,
        app_metadata: { role, employee_id: employeeId },
        user_metadata: { display_name: body.displayName || email, employee_id: employeeId },
      });
      if (error || !data.user) return NextResponse.json({ error: error?.message || "Employee account creation failed" }, { status: 400 });
      target = data.user;
      created = true;
    } else {
      const { data, error } = await admin.auth.admin.updateUserById(target.id, {
        password: body.password,
        app_metadata: { ...target.app_metadata, role, employee_id: employeeId },
        user_metadata: { ...target.user_metadata, display_name: body.displayName || email, employee_id: employeeId },
      });
      if (error || !data.user) return NextResponse.json({ error: error?.message || "Employee account update failed" }, { status: 400 });
      target = data.user;
    }
  } else {
    const { data: existing, error: lookupError } = await admin.auth.admin.getUserById(body.userId!);
    if (lookupError || !existing.user) return NextResponse.json({ error: lookupError?.message || "User was not found" }, { status: 404 });
    const { data, error } = await admin.auth.admin.updateUserById(body.userId!, {
      ...(body.password ? { password: body.password } : {}),
      app_metadata: { ...existing.user.app_metadata, role },
      user_metadata: { ...existing.user.user_metadata, display_name: body.displayName || existing.user.user_metadata?.display_name },
    });
    if (error || !data.user) return NextResponse.json({ error: error?.message || "Account update failed" }, { status: 400 });
    target = data.user;
  }

  const permissionRow = {
    user_id: target.id,
    email: email || target.email || "",
    display_name: body.displayName || target.user_metadata?.display_name || null,
    role,
    permissions: body.permissions && typeof body.permissions === "object" ? body.permissions : {},
    updated_at: new Date().toISOString(),
  };
  const { error: permissionError } = await admin.from("user_permissions").upsert(permissionRow, { onConflict: "user_id" });
  if (permissionError) {
    if (created) await admin.auth.admin.deleteUser(target.id);
    return NextResponse.json({ error: `Permissions could not be saved: ${permissionError.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, user: permissionRow });
}

export async function DELETE(request: Request) {
  const { url, publishableKey, serviceRoleKey } = configuration();
  if (!url || !publishableKey) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const verification = await verifyAdministrator(url, publishableKey, request);
  if (verification.error) return verification.error;
  const { userId } = (await request.json()) as { userId?: string };
  if (!userId) return NextResponse.json({ error: "A valid user is required" }, { status: 400 });
  if (userId === verification.user.id) return NextResponse.json({ error: "You cannot delete your own administrator account" }, { status: 400 });

  if (!serviceRoleKey) {
    const response = await fetch(`${url}/functions/v1/admin-user-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${verification.token}`, apikey: publishableKey },
      body: JSON.stringify({ action: "delete", userId }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({ error: "Employee account service returned an invalid response" }));
    return NextResponse.json(result, { status: response.status });
  }

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
  const { error: permissionError } = await admin.from("user_permissions").delete().eq("user_id", userId);
  if (permissionError) return NextResponse.json({ error: `Account deleted, but its access profile could not be removed: ${permissionError.message}` }, { status: 500 });
  return NextResponse.json({ ok: true });
}
