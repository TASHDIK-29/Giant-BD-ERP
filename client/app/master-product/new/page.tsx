"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createMasterProduct, getCategories, getMaterials, getSession, logout, type CategoryRecord, type MaterialRecord, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewMasterProductPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [subCategories, setSubCategories] = useState<CategoryRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      return Promise.all([getCategories("CATEGORY", 1, 100), getCategories("SUB_CATEGORY", 1, 100), getMaterials(1, 100)]).then(([categoryResponse, subCategoryResponse, materialResponse]) => {
        if (!mounted) return;
        setCategories(categoryResponse.data.filter((category) => category.status === "ACTIVE"));
        setSubCategories(subCategoryResponse.data.filter((category) => category.status === "ACTIVE"));
        setMaterials(materialResponse.data);
      });
    }).catch((requestError) => {
      if (!mounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load product options.");
    }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  const availableSubCategories = useMemo(() => subCategories.filter((category) => String(category.parentId) === categoryId), [categoryId, subCategories]);

  function handleCategoryChange(value: string) { setCategoryId(value); setSubCategoryId(""); }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || !categoryId || !materialId) { setError("Name, category, and material are required."); return; }
    setError(""); setIsSaving(true);
    try { await createMasterProduct({ name: name.trim(), categoryId: Number(categoryId), materialId: Number(materialId), ...(subCategoryId ? { subCategoryId: Number(subCategoryId) } : {}) }); router.push("/master-product"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create master product."); }
    finally { setIsSaving(false); }
  }

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading product form...</p></main>;

  return <WorkspaceShell activeItem="Master FG Product" breadcrumb="Master FG Product / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT CATALOG</p><h1>New Master FG Product</h1><p className="intro-copy">Define a finished-goods product and connect it to its catalog attributes.</p></div></div><form className="permission-form product-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">PRODUCT DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="product-name">Name</label><input id="product-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Classic Polo Shirt" maxLength={255} required /><p className="field-hint">The SKU will be generated automatically from the product name and category.</p></section><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">CLASSIFICATION</p><h2>Catalog attributes</h2></div></div><label htmlFor="product-category">Category</label><select id="product-category" value={categoryId} onChange={(event) => handleCategoryChange(event.target.value)} required><option value="">Select a top-level category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><label htmlFor="product-sub-category">Sub-category</label><select id="product-sub-category" value={subCategoryId} onChange={(event) => setSubCategoryId(event.target.value)} disabled={!categoryId}><option value="">Optional sub-category</option>{availableSubCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><label htmlFor="product-material">Material</label><select id="product-material" value={materialId} onChange={(event) => setMaterialId(event.target.value)} required><option value="">Select material</option>{materials.map((material) => <option value={material.id} key={material.id}>{material.name}</option>)}</select>{categoryId && availableSubCategories.length === 0 && <p className="field-hint">No sub-categories are available under this category.</p>}</section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/master-product")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving || categories.length === 0 || materials.length === 0}>{isSaving ? "Creating..." : "Create product"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }