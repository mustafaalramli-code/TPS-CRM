import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishableKey || !serviceRoleKey) return NextResponse.json({ error: "Server password administration is not configured" }, { status: 503 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Administrator sign-in is required" }, { status: 401 });
  const verifier = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: userError } = await verifier.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "Invalid administrator session" }, { status: 401 });
  if (user.app_metadata?.role !== "admin") return NextResponse.json({ error: "Administrator access is required" }, { status: 403 });
  const body = await request.json();
  const role = ["admin", "user", "other"].includes(body.role) ? body.role : "user";
  const isProvisioning = typeof body.employeeId === "string" && body.employeeId.trim().length > 0;
  if (!isProvisioning && typeof body.userId !== "string") return NextResponse.json({ error: "A valid user is required" }, { status: 400 });
  if (body.password !== undefined && (typeof body.password !== "string" || body.password.length < 8)) return NextResponse.json({ error: "Password must contain at least 8 characters" }, { status: 400 });
  if (isProvisioning && (typeof body.email !== "string" || !body.email.includes("@") || typeof body.password !== "string")) return NextResponse.json({ error: "A valid employee email and password are required" }, { status: 400 });
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let userId = body.userId as string | undefined;
  if (isProvisioning) {
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      email_confirm: true,
      app_metadata: { role, employee_id: body.employeeId },
      user_metadata: { display_name: body.displayName || body.email, employee_id: body.employeeId },
    });
    if (error || !data.user) return NextResponse.json({ error: error?.message || "Employee account creation failed" }, { status: 400 });
    userId = data.user.id;
  } else {
    const attributes: { password?: string; app_metadata: Record<string, string> } = { app_metadata: { role } };
    if (body.password) attributes.password = body.password;
    const { error } = await admin.auth.admin.updateUserById(userId!, attributes);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  const permissionRow = {
    user_id: userId!,
    email: String(body.email || "").trim().toLowerCase(),
    display_name: body.displayName || null,
    role,
    permissions: body.permissions && typeof body.permissions === "object" ? body.permissions : {},
    updated_at: new Date().toISOString(),
  };
  const { error: permissionError } = await admin.from("user_permissions").upsert(permissionRow, { onConflict: "user_id" });
  if (permissionError) {
    if (isProvisioning) await admin.auth.admin.deleteUser(userId!);
    return NextResponse.json({ error: `Permissions could not be saved: ${permissionError.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, user: permissionRow });
}
