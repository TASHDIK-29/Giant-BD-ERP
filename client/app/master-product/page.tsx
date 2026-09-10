"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMasterProducts, getSession, logout, type MasterProductRecord, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function MasterProductPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<MasterProductRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      return getMasterProducts().then((response) => { if (mounted) setProducts(response.data); });
    }).catch((requestError) => {
      if (!mounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load master products.");
    }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading master products...</p></main>;

  return <WorkspaceShell activeItem="Master FG Product" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT CATALOG</p><h1>Master FG Product</h1><p className="intro-copy">Manage finished-goods product definitions and their classifications.</p></div><button className="primary-button compact-button" onClick={() => router.push("/master-product/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Products unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <ProductTable products={products} />}</WorkspaceShell>;
}

function ProductTable({ products }: { products: MasterProductRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{products.length}</strong><span>master products</span></div><span className="data-badge">{products.filter((product) => product.status === "ACTIVE").length} active</span></div><div className="permission-table-scroll"><table className="permission-table master-product-table"><thead><tr><th>Id</th><th>Product</th><th>Category</th><th>Sub-category</th><th>Material</th><th>Variants</th><th>Status</th></tr></thead><tbody>{products.length === 0 ? <tr><td className="table-empty" colSpan={7}>No master products found.</td></tr> : products.map((product) => <tr key={product.id}><td className="id-cell">{product.id}</td><td><strong>{product.name}</strong><span className="module-key">{product.sku}</span></td><td>{product.category.name}</td><td>{product.subCategory?.name || "-"}</td><td>{product.material.name}</td><td className="role-number">{product._count?.variants ?? product.variantsCount ?? 0}</td><td><span className={`role-status ${product.status.toLowerCase()}`}>{product.status}</span></td></tr>)}</tbody></table></div></section>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }