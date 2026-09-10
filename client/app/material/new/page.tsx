"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createMaterial, getSession, logout, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewMaterialPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { getSession().then(setSession).catch(() => router.replace("/")).finally(() => setIsLoading(false)); }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) { setError("Material name must contain at least 2 characters."); return; }
    setError(""); setIsSaving(true);
    try { await createMaterial({ name: name.trim(), description: description.trim() || undefined }); router.push("/material"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create material."); }
    finally { setIsSaving(false); }
  }

  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading material form...</p></main>;

  return <WorkspaceShell activeItem="Material" breadcrumb="Material / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>New material</h1><p className="intro-copy">Add a material for product variants.</p></div></div><form className="permission-form attribute-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">MATERIAL DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="material-name">Name</label><input id="material-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Cotton" maxLength={100} required /><label htmlFor="material-description">Description</label><textarea id="material-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" maxLength={1000} /></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/material")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving}>{isSaving ? "Creating..." : "Create material"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}