"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession, getUsers, logout, type Session, type UserRecord } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function UserPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getSession().then((currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      return getUsers().then((response) => { if (isMounted) setUsers(response.data); });
    }).catch((requestError) => {
      if (!isMounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load users.");
    }).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading users...</p></main>;

  return <WorkspaceShell activeItem="User" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h1>User</h1><p className="intro-copy">Manage people, roles, and account status.</p></div><button className="primary-button compact-button" onClick={() => router.push("/user/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Users unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <UserTable users={users} />}</WorkspaceShell>;
}

function UserTable({ users }: { users: UserRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{users.length}</strong><span>users</span></div><span className="data-badge">{users.filter((user) => user.status === "ACTIVE").length} active</span></div><div className="permission-table-scroll"><table className="permission-table user-table"><thead><tr><th>Id</th><th>User</th><th>Role</th><th>Phone</th><th>Status</th><th>Created</th></tr></thead><tbody>{users.length === 0 ? <tr><td className="table-empty" colSpan={6}>No users found.</td></tr> : users.map((user) => <tr key={user.id}><td className="id-cell">{user.id}</td><td><strong>{user.name}</strong><span className="module-key">{user.email}</span></td><td><strong>{user.role.name}</strong><span className="module-key">{user.role.status}</span></td><td>{user.phone || "-"}</td><td><span className={`role-status ${user.status.toLowerCase()}`}>{user.status}</span></td><td className="date-cell">{formatDate(user.createdAt)}</td></tr>)}</tbody></table></div></section>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }