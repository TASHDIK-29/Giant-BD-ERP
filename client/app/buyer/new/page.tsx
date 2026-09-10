"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createBuyer, getSession, logout, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewBuyerPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"LOCAL" | "INTERNATIONAL">("LOCAL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { getSession().then(setSession).catch(() => router.replace("/")).finally(() => setIsLoading(false)); }, [router]);
  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) { setError("Buyer name must contain at least 2 characters."); return; }
    setError(""); setIsSaving(true);
    try { await createBuyer({ name: name.trim(), type }); router.push("/buyer"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create buyer."); }
    finally { setIsSaving(false); }
  }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading buyer form...</p></main>;

  return <WorkspaceShell activeItem="Buyer" breadcrumb="Buyer / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">CUSTOMER RELATIONSHIP</p><h1>New buyer</h1><p className="intro-copy">Add a local or international buyer.</p></div></div><form className="permission-form attribute-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">BUYER DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="buyer-name">Name</label><input id="buyer-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Northstar Apparel" maxLength={150} required /><label htmlFor="buyer-type">Type</label><select id="buyer-type" value={type} onChange={(event) => setType(event.target.value as "LOCAL" | "INTERNATIONAL")}><option value="LOCAL">Local</option><option value="INTERNATIONAL">International</option></select></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/buyer")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving}>{isSaving ? "Creating..." : "Create buyer"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}