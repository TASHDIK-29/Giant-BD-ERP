"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createPermissionGroup, getPermissionGroups, getSession, logout, type PermissionGroup, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewPermissionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [name, setName] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [customActions, setCustomActions] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        return getPermissionGroups().then((response) => { if (isMounted) setGroups(response.data); });
      })
      .catch((requestError) => { if (isMounted && getStatus(requestError) === 401) router.replace("/"); else if (isMounted) setError(requestError instanceof Error ? requestError.message : "Unable to load permissions."); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  const actions = useMemo(() => Array.from(new Set(groups.flatMap((group) => group.permissions.map((permission) => permission.action)))).sort(), [groups]);
  const keyPreview = toPermissionKey(name);

  function toggleAction(action: string) { setSelectedActions((current) => current.includes(action) ? current.filter((item) => item !== action) : [...current, action]); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const custom = customActions.split(",").map((action) => action.trim()).filter(Boolean);
    const allActions = Array.from(new Set([...selectedActions, ...custom]));
    if (!name.trim()) return setError("Enter a name for the permission module.");
    if (!keyPreview) return setError("The module name must contain letters or numbers.");
    if (!allActions.length) return setError("Select at least one permission or add a custom action.");
    setError("");
    setIsSaving(true);
    try {
      await createPermissionGroup({ name: name.trim(), key: keyPreview, actions: allActions });
      router.push("/permission");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create permission module.");
    } finally { setIsSaving(false); }
  }

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading permissions...</p></main>;

  return <WorkspaceShell activeItem="Permission" breadcrumb="Permission / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h1>New permission module</h1><p className="intro-copy">Define the actions this module will make available.</p></div></div><form className="permission-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">MODULE DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="permission-name">Name</label><input id="permission-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Reports" maxLength={100} /><p className="field-hint">Permission key: <strong>{keyPreview || "module-key"}</strong></p></section><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">EXISTING ACTIONS</p><h2>Choose permissions</h2></div><span className="data-badge">{selectedActions.length} selected</span></div><div className="action-grid">{actions.length ? actions.map((action) => <label className="action-option" key={action}><input type="checkbox" checked={selectedActions.includes(action)} onChange={() => toggleAction(action)} /><span>{action}</span></label>) : <p className="empty-copy">No existing actions found. Add a custom action below.</p>}</div></section><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">CUSTOM ACTION</p><h2>Add another permission</h2></div></div><label htmlFor="custom-actions">Action name</label><input id="custom-actions" value={customActions} onChange={(event) => setCustomActions(event.target.value)} placeholder="e.g. export, approve" maxLength={255} /><p className="field-hint">Separate multiple custom actions with commas.</p></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/permission")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving}>{isSaving ? "Creating..." : "Create module"}</button></div></form></WorkspaceShell>;
}

function toPermissionKey(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }