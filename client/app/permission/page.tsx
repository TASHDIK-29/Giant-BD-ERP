"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getPermissionGroups, getSession, logout, type PermissionGroup, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function PermissionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        return getPermissionGroups().then((response) => {
          if (isMounted) setGroups(response.data);
        });
      })
      .catch((requestError) => {
        if (!isMounted) return;
        if (getStatus(requestError) === 401) router.replace("/");
        else setError(requestError instanceof Error ? requestError.message : "Unable to load permissions.");
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  async function handleLogout() {
    try { await logout(); } finally { router.replace("/"); }
  }

  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading permissions...</p></main>;

  const columns = getPermissionColumns(groups);

  return <WorkspaceShell activeItem="Permission" user={session.user} onLogout={handleLogout}>
    <div className="page-intro permission-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h1>Permission</h1><p className="intro-copy">Manage the permissions available across each module.</p></div><button className="primary-button compact-button" onClick={() => router.push("/permission/new")}>Create new <span aria-hidden="true">+</span></button></div>
    {error ? <section className="data-error panel"><h2>Permissions unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <PermissionMatrix groups={groups} columns={columns} />}
  </WorkspaceShell>;
}

function PermissionMatrix({ groups, columns }: { groups: PermissionGroup[]; columns: string[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{groups.length}</strong><span>permission modules</span></div><span className="data-badge">{columns.length} actions</span></div><div className="permission-table-scroll"><table className="permission-table permission-list-matrix"><thead><tr><th>Id</th><th>Module name</th>{columns.map((column) => <th key={column} title={column}>{column}</th>)}</tr></thead><tbody>{groups.length === 0 ? <tr><td className="table-empty" colSpan={columns.length + 2}>No permission modules found.</td></tr> : groups.map((group) => <tr key={group.id}><td className="id-cell">{group.id}</td><td><strong>{group.name}</strong><span className="module-key">{group.key}</span></td>{columns.map((column) => <td key={column} className="permission-state">{group.permissions.some((permission) => permission.action === column) ? <span className="permission-yes" aria-label={`${group.name} ${column} enabled`}>✓</span> : <span className="permission-no" aria-label={`${group.name} ${column} unavailable`}>-</span>}</td>)}</tr>)}</tbody></table></div></section>;
}

function getPermissionColumns(groups: PermissionGroup[]) { return Array.from(new Set(groups.flatMap((group) => group.permissions.map((permission) => permission.action)))).sort(); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }