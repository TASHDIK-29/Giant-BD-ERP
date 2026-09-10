"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createColor, getSession, logout, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewColorPage() {
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
    if (name.trim().length < 2) { setError("Color name must contain at least 2 characters."); return; }
    setError(""); setIsSaving(true);
    try { await createColor({ name: name.trim(), description: description.trim() || undefined }); router.push("/color"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create color."); }
    finally { setIsSaving(false); }
  }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading color form...</p></main>;

  return <WorkspaceShell activeItem="Color" breadcrumb="Color / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>New color</h1><p className="intro-copy">Add a color for product variants.</p></div></div><form className="permission-form attribute-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">COLOR DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="color-name">Name</label><input id="color-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Midnight Blue" maxLength={100} required /><label htmlFor="color-description">Description</label><textarea id="color-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" maxLength={1000} /></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/color")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving}>{isSaving ? "Creating..." : "Create color"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}