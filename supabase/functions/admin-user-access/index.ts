import { createClient } from "npm:@supabase/supabase-js@2";

const jsonHeaders = { "Content-Type": "application/json" };

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization") || "";
  if (!url || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase user administration is not configured" }), { status: 503, headers: jsonHeaders });
  }

  const verifier = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await verifier.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid administrator session" }), { status: 401, headers: jsonHeaders });
  }

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: callerAccess } = await admin.from("user_permissions").select("role").eq("user_id", user.id).maybeSingle();
  if (user.app_metadata?.role !== "admin" && callerAccess?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Administrator access is required" }), { status: 403, headers: jsonHeaders });
  }

  const body = await request.json();
  const role = ["admin", "user", "other"].includes(body.role) ? body.role : "user";
  const isProvisioning = typeof body.employeeId === "string" && body.employeeId.trim().length > 0;
  if (!isProvisioning && typeof body.userId !== "string") {
    return new Response(JSON.stringify({ error: "A valid user is required" }), { status: 400, headers: jsonHeaders });
  }
  if (body.password !== undefined && (typeof body.password !== "string" || body.password.length < 8)) {
    return new Response(JSON.stringify({ error: "Password must contain at least 8 characters" }), { status: 400, headers: jsonHeaders });
  }
  if (isProvisioning && (typeof body.email !== "string" || !body.email.includes("@") || typeof body.password !== "string")) {
    return new Response(JSON.stringify({ error: "A valid employee email and password are required" }), { status: 400, headers: jsonHeaders });
  }

  let userId = body.userId as string | undefined;
  if (isProvisioning) {
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      email_confirm: true,
      app_metadata: { role, employee_id: body.employeeId },
      user_metadata: { display_name: body.displayName || body.email, employee_id: body.employeeId },
    });
    if (error || !data.user) {
      return new Response(JSON.stringify({ error: error?.message || "Employee account creation failed" }), { status: 400, headers: jsonHeaders });
    }
    userId = data.user.id;
  } else {
    const attributes: { password?: string; app_metadata: Record<string, string> } = { app_metadata: { role } };
    if (body.password) attributes.password = body.password;
    const { error } = await admin.auth.admin.updateUserById(userId!, attributes);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: jsonHeaders });
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
    return new Response(JSON.stringify({ error: `Permissions could not be saved: ${permissionError.message}` }), { status: 500, headers: jsonHeaders });
  }

  return new Response(JSON.stringify({ ok: true, user: permissionRow }), { status: 200, headers: jsonHeaders });
});
