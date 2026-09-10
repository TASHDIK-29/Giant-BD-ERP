"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getProductVariants, getSession, logout, type ProductVariantRecord, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function VariantProductPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [variants, setVariants] = useState<ProductVariantRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      return getProductVariants().then((response) => { if (mounted) setVariants(response.data); });
    }).catch((requestError) => {
      if (!mounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load product variants.");
    }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading product variants...</p></main>;

  return <WorkspaceShell activeItem="Variant FG Product" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT CATALOG</p><h1>Variant FG Product</h1><p className="intro-copy">Manage size, color, gender, and packaging variants.</p></div><button className="primary-button compact-button" onClick={() => router.push("/variant-product/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Variants unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <VariantTable variants={variants} />}</WorkspaceShell>;
}

function VariantTable({ variants }: { variants: ProductVariantRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{variants.length}</strong><span>variants</span></div><span className="data-badge">{variants.filter((variant) => variant.status === "ACTIVE").length} active</span></div><div className="permission-table-scroll"><table className="permission-table variant-table"><thead><tr><th>Id</th><th>SKU</th><th>Master product</th><th>Color</th><th>Size</th><th>Gender</th><th>Pack</th><th>Status</th></tr></thead><tbody>{variants.length === 0 ? <tr><td className="table-empty" colSpan={8}>No product variants found.</td></tr> : variants.map((variant) => <tr key={variant.id}><td className="id-cell">{variant.id}</td><td><strong>{variant.sku}</strong><span className="module-key">{variant.modelNumber || "No model number"}</span></td><td>{variant.masterProduct.name}<span className="module-key">{variant.masterProduct.sku}</span></td><td>{variant.color.name}</td><td className="role-number">{variant.size}</td><td>{variant.gender === "MALE" ? "Male" : "Female"}</td><td>{variant.productsPerPacket} / {variant.uom}</td><td><span className={`role-status ${variant.status.toLowerCase()}`}>{variant.status}</span></td></tr>)}</tbody></table></div></section>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }