"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSubCategory, getCategories, getSession, logout, type CategoryRecord, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewSubCategoryPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { let mounted = true; getSession().then((currentSession) => { if (!mounted) return; setSession(currentSession); return getCategories("CATEGORY").then((response) => { if (mounted) setCategories(response.data); }); }).catch((requestError) => { if (mounted) { if (getStatus(requestError) === 401) router.replace("/"); else setError(requestError instanceof Error ? requestError.message : "Unable to load categories."); } }).finally(() => { if (mounted) setIsLoading(false); }); return () => { mounted = false; }; }, [router]);
  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!name.trim() || !parentId) return setError("Name and parent category are required."); setError(""); setIsSaving(true); try { await createSubCategory({ name: name.trim(), parentId: Number(parentId), description: description.trim() || undefined, sortOrder: Number(sortOrder) || 0 }); router.push("/sub-category"); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create sub-category."); } finally { setIsSaving(false); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading sub-category form...</p></main>;
  return <WorkspaceShell activeItem="Sub Category" breadcrumb="Sub Category / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>New sub-category</h1><p className="intro-copy">Add a sub-category under a top-level category.</p></div></div><form className="permission-form category-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">SUB-CATEGORY DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="sub-category-name">Name</label><input id="sub-category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. T-Shirts" maxLength={150} required /><label htmlFor="sub-category-parent">Parent category</label><select id="sub-category-parent" value={parentId} onChange={(event) => setParentId(event.target.value)} required><option value="">Select a category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><label htmlFor="sub-category-description">Description</label><textarea id="sub-category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" maxLength={1000} /><label htmlFor="sub-category-sort">Sort order</label><input id="sub-category-sort" type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/sub-category")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving || categories.length === 0}>{isSaving ? "Creating..." : "Create sub-category"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }