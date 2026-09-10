"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createRole, getPermissionGroups, getSession, logout, type PermissionGroup, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewRolePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [grantAll, setGrantAll] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        return getPermissionGroups(1, 100).then((response) => { if (isMounted) setGroups(response.data); });
      })
      .catch((requestError) => {
        if (!isMounted) return;
        if (getStatus(requestError) === 401) router.replace("/");
        else setError(requestError instanceof Error ? requestError.message : "Unable to load permissions.");
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  const actions = useMemo(() => Array.from(new Set(groups.flatMap((group) => group.permissions.map((permission) => permission.action)))).sort(), [groups]);

  function togglePermission(id: number) {
    if (grantAll) return;
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function handleGrantAllChange(enabled: boolean) {
    setGrantAll(enabled);
    if (enabled) setSelectedIds([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a name for the role.");
    if (!grantAll && selectedIds.length === 0) return setError("Select at least one permission or choose grant all.");
    setError("");
    setIsSaving(true);
    try {
      await createRole({ name: name.trim(), description: description.trim() || undefined, ...(grantAll ? { grantAll: true } : { permissionIds: selectedIds }) });
      router.push("/role");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create role.");
    } finally { setIsSaving(false); }
  }

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading role permissions...</p></main>;

  return <WorkspaceShell activeItem="Role" breadcrumb="Role / New" user={session.user} onLogout={handleLogout}>
    <div className="page-intro permission-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h1>New role</h1><p className="intro-copy">Create a role and assign the permissions it can use.</p></div></div>
    <form className="permission-form role-form" onSubmit={handleSubmit}>
      <section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">ROLE DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="role-name">Name</label><input id="role-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Warehouse Manager" maxLength={100} /><label htmlFor="role-description">Description</label><textarea id="role-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What can this role access?" maxLength={255} /></section>
      <section className="panel form-section role-permissions-section"><div className="form-section-heading"><div><p className="eyebrow">PERMISSIONS</p><h2>Assign permissions</h2></div><span className="data-badge">{grantAll ? "All selected" : `${selectedIds.length} selected`}</span></div><label className={`grant-all-option ${grantAll ? "is-checked" : ""}`}><input type="checkbox" checked={grantAll} onChange={(event) => handleGrantAllChange(event.target.checked)} /><span>Grant all existing permissions</span><small>{grantAll ? "Individual permissions are disabled" : "Choose specific permissions below"}</small></label><PermissionMatrix groups={groups} actions={actions} selectedIds={selectedIds} grantAll={grantAll} onToggle={togglePermission} /></section>
      {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/role")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving}>{isSaving ? "Creating..." : "Create role"}</button></div>
    </form>
  </WorkspaceShell>;
}

function PermissionMatrix({ groups, actions, selectedIds, grantAll, onToggle }: { groups: PermissionGroup[]; actions: string[]; selectedIds: number[]; grantAll: boolean; onToggle: (id: number) => void }) {
  if (groups.length === 0 || actions.length === 0) return <p className="empty-copy">No existing permissions found.</p>;
  return <div className={`role-permission-table-wrap ${grantAll ? "is-disabled" : ""}`}><table className="role-permission-table permission-matrix"><thead><tr><th>Module</th>{actions.map((action) => <th key={action}>{action}</th>)}</tr></thead><tbody>{groups.map((group) => <tr key={group.id}><td><strong>{group.name}</strong><span>{group.key}</span></td>{actions.map((action) => { const permission = group.permissions.find((item) => item.action === action); return <td key={action}>{permission ? <input type="checkbox" aria-label={`${group.name} ${action}`} disabled={grantAll} checked={grantAll || selectedIds.includes(permission.id)} onChange={() => onToggle(permission.id)} /> : <span className="permission-empty">-</span>}</td>; })}</tr>)}</tbody></table></div>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }