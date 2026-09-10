"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, getSession, logout, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewCategoryPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { getSession().then(setSession).catch(() => router.replace("/")).finally(() => setIsLoading(false)); }, [router]);
  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a category name.");
    setError(""); setIsSaving(true);
    try { await createCategory({ name: name.trim(), description: description.trim() || undefined, sortOrder: Number(sortOrder) || 0 }); router.push("/category"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create category."); }
    finally { setIsSaving(false); }
  }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading category form...</p></main>;
  return <WorkspaceShell activeItem="Category" breadcrumb="Category / New" user={session.user} onLogout={handleLogout}><CategoryForm title="New category" name={name} setName={setName} description={description} setDescription={setDescription} sortOrder={sortOrder} setSortOrder={setSortOrder} error={error} isSaving={isSaving} onSubmit={handleSubmit} onCancel={() => router.push("/category")} /></WorkspaceShell>;
}

export function CategoryForm({ title, name, setName, description, setDescription, sortOrder, setSortOrder, error, isSaving, onSubmit, onCancel }: { title: string; name: string; setName: (value: string) => void; description: string; setDescription: (value: string) => void; sortOrder: string; setSortOrder: (value: string) => void; error: string; isSaving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>{title}</h1><p className="intro-copy">Add a new top-level category.</p></div></div><form className="permission-form category-form" onSubmit={onSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">CATEGORY DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="category-name">Name</label><input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Apparel" maxLength={150} required /><label htmlFor="category-description">Description</label><textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" maxLength={1000} /><label htmlFor="category-sort">Sort order</label><input id="category-sort" type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving}>{isSaving ? "Creating..." : "Create category"}<span aria-hidden="true">-&gt;</span></button></div></form></>;
}