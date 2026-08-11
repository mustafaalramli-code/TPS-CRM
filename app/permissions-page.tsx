"use client";

import { useEffect, useMemo, useState } from "react";
import { readSupabaseTable, supabase, upsertSupabaseRow } from "./supabase";

type Access = { view: boolean; edit: boolean };
type PermissionRow = { user_id: string; email: string; display_name: string | null; role: string; permissions: Record<string, Access> };
type EmployeeRef = { id: string; name: string; email?: string };
const modules = ["Overview", "Customers", "Contacts", "Opportunities", "Projects", "Suppliers", "Activities", "Tasks", "Employees", "Directory", "Reports"];
const labels: Record<string, string> = { Customers: "Clients", Directory: "Settings" };

export default function PermissionsPage({ announce, employees = [] }: { announce: (message: string) => void; employees?: EmployeeRef[] }) {
  const [rows, setRows] = useState<PermissionRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const selected = useMemo(() => rows.find((row) => row.user_id === selectedId) || rows[0], [rows, selectedId]);
  const isEmployeeOnly = selected?.user_id.startsWith("employee:") ?? false;

  useEffect(() => {
    void (async () => {
      try {
        const session = (await supabase?.auth.getSession())?.data.session;
        setIsAdmin(session?.user.app_metadata?.role === "admin");
        const data = await readSupabaseTable<PermissionRow>("user_permissions");
        const employeeAccess = employees.map((employee) => ({
          user_id: `employee:${employee.id}`,
          email: employee.email || `${employee.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@tps.example`,
          display_name: employee.name,
          role: "user",
          permissions: {},
        }));
        const employeeNames = new Set(employeeAccess.map((row) => row.display_name));
        const merged = [...data.filter((row) => !row.display_name || !employeeNames.has(row.display_name)), ...employeeAccess];
        setRows(merged);
        setSelectedId((current) => current && merged.some((row) => row.user_id === current) ? current : merged[0]?.user_id || "");
      } catch (error: any) { announce(`Could not load permissions: ${error.message}`); }
      finally { setLoading(false); }
    })();
  }, [employees, announce]);

  function updateSelected(change: (row: PermissionRow) => PermissionRow) {
    if (!selected || !isAdmin) return;
    setRows((current) => current.map((row) => row.user_id === selected.user_id ? change(row) : row));
  }
  function setModule(module: string, key: keyof Access, value: boolean) {
    updateSelected((row) => {
      const next = { ...(row.permissions?.[module] || { view: false, edit: false }), [key]: value };
      if (key === "edit" && value) next.view = true;
      if (key === "view" && !value) next.edit = false;
      return { ...row, permissions: { ...row.permissions, [module]: next } };
    });
  }
  async function save() {
    if (!selected || !isAdmin) return;
    if (isEmployeeOnly) { announce("Create a Supabase user account for this employee before assigning access"); return; }
    if (newPassword !== confirmPassword) { announce("New password and confirm password do not match"); return; }
    if (newPassword && newPassword.length < 8) { announce("Password must contain at least 8 characters"); return; }
    setSaving(true);
    try {
      await upsertSupabaseRow("user_permissions", { ...selected, updated_at: new Date().toISOString() }, "user_id");
      if (newPassword) {
        const session = (await supabase?.auth.getSession())?.data.session;
        if (!session) throw new Error("An administrator session is required to change passwords");
        const response = await fetch("/api/admin/users/password", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ userId: selected.user_id, password: newPassword }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Password update failed");
        setNewPassword(""); setConfirmPassword("");
      }
      announce(`User access saved for ${selected.email}`);
    } catch (error: any) { announce(`User access save failed: ${error.message}`); }
    finally { setSaving(false); }
  }
  if (loading) return <article className="permissions-shell"><p>Loading user permissions...</p></article>;

  return <div className="permissions-layout">
    <aside className="permissions-users"><div className="permissions-list-head"><span>USERS &amp; EMPLOYEES</span><strong>{rows.length}</strong></div>{rows.map((row) => <button key={row.user_id} className={selected?.user_id === row.user_id ? "active" : ""} onClick={() => { setSelectedId(row.user_id); setNewPassword(""); setConfirmPassword(""); }}><i>{(row.display_name || row.email).slice(0, 2).toUpperCase()}</i><span><strong>{row.display_name || row.email.split("@")[0]}</strong><small>{row.user_id.startsWith("employee:") ? "Employee - account not provisioned" : row.email}</small></span></button>)}</aside>
    <article className="permissions-shell">{!selected ? <div className="permissions-empty">No users or employees are available yet.</div> : <>
      <header className="permissions-header"><div><span>ACCESS PROFILE</span><h2>{selected.display_name || selected.email}</h2><p>{selected.email}</p></div><label>User category<select value={selected.role} disabled={!isAdmin || isEmployeeOnly} onChange={(event) => updateSelected((row) => ({ ...row, role: event.target.value }))}><option value="admin">Administrator</option><option value="user">User</option><option value="other">Others</option></select></label></header>
      <div className="permissions-passwords"><label>New password<input type="password" autoComplete="new-password" value={newPassword} disabled={!isAdmin || isEmployeeOnly} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minimum 8 characters" /></label><label>Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} disabled={!isAdmin || isEmployeeOnly} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat new password" /></label></div>
      <div className="permissions-note"><strong>{isEmployeeOnly ? "Employee record" : isAdmin ? "Administrator controls" : "Read-only access"}</strong><span>{isEmployeeOnly ? "Create a Supabase user account for this employee before assigning permissions." : isAdmin ? "Choose the user category, password, and module access." : "Only administrators can change user access."}</span></div>
      <div className="permission-matrix"><div className="permission-matrix-head"><span>Module</span><span>View</span><span>Edit</span></div>{modules.map((module) => { const access = selected.permissions?.[module] || { view: false, edit: false }; return <div className="permission-row" key={module}><span><b>{module.slice(0, 2).toUpperCase()}</b><strong>{labels[module] || module}</strong></span><label><input type="checkbox" checked={access.view} disabled={!isAdmin || isEmployeeOnly || selected.role === "admin"} onChange={(event) => setModule(module, "view", event.target.checked)} /></label><label><input type="checkbox" checked={access.edit} disabled={!isAdmin || isEmployeeOnly || selected.role === "admin"} onChange={(event) => setModule(module, "edit", event.target.checked)} /></label></div>; })}</div>
      <footer className="permissions-footer"><span>{isEmployeeOnly ? "Account provisioning is required before access can be granted." : selected.role === "admin" ? "Administrators always have full access." : "Edit permission automatically includes view permission."}</span><button disabled={!isAdmin || isEmployeeOnly || saving} onClick={save}>{saving ? "Saving..." : "Save user access"}</button></footer>
    </>}</article>
  </div>;
}
