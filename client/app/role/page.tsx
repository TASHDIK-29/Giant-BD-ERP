"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getRoles, getSession, logout, type Role, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function RolePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        return getRoles().then((response) => { if (isMounted) setRoles(response.data); });
      })
      .catch((requestError) => {
        if (!isMounted) return;
        if (getStatus(requestError) === 401) router.replace("/");
        else setError(requestError instanceof Error ? requestError.message : "Unable to load roles.");
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  async function handleLogout() {
    try { await logout(); } finally { router.replace("/"); }
  }

  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading roles...</p></main>;

  return <WorkspaceShell activeItem="Role" user={session.user} onLogout={handleLogout}>
    <div className="page-intro permission-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h1>Role</h1><p className="intro-copy">Manage roles and the permissions assigned to each one.</p></div><button className="primary-button compact-button" onClick={() => router.push("/role/new")}>Create new <span aria-hidden="true">+</span></button></div>
    {error ? <section className="data-error panel"><h2>Roles unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <RoleTable roles={roles} />}
  </WorkspaceShell>;
}

function RoleTable({ roles }: { roles: Role[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{roles.length}</strong><span>roles</span></div><span className="data-badge">{roles.filter((role) => role.isSystem).length} system</span></div><div className="permission-table-scroll"><table className="permission-table role-table"><thead><tr><th>Id</th><th>Role name</th><th>Status</th><th>Users</th><th>Permissions</th><th>Type</th></tr></thead><tbody>{roles.length === 0 ? <tr><td className="table-empty" colSpan={6}>No roles found.</td></tr> : roles.map((role) => <RoleRow role={role} key={role.id} />)}</tbody></table></div></section>;
}

function RoleRow({ role }: { role: Role }) {
  return <tr><td className="id-cell">{role.id}</td><td><strong>{role.name}</strong><span className="module-key">{role.description || "No description"}</span></td><td><span className={`role-status ${role.status.toLowerCase()}`}>{role.status}</span></td><td className="role-number">{formatNumber(role.userCount)}</td><td className="role-number">{formatNumber(role.permissionCount)}</td><td><span className={`role-type ${role.isSystem ? "system" : "custom"}`}>{role.isSystem ? "System" : "Custom"}</span></td></tr>;
}

function formatNumber(value: number) { return new Intl.NumberFormat("en-US").format(value); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }