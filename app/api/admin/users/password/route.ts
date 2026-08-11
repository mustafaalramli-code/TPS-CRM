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
  if (typeof body.userId !== "string" || typeof body.password !== "string" || body.password.length < 8) return NextResponse.json({ error: "A valid user and password of at least 8 characters are required" }, { status: 400 });
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.updateUserById(body.userId, { password: body.password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
