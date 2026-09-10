"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getStockIns, logout, type Session, type StockInRecord } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function BatchListPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [batches, setBatches] = useState<StockInRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => { if (!mounted) return; setSession(currentSession); return getStockIns().then((response) => { if (mounted) setBatches(response.data); }); }).catch((requestError) => { if (!mounted) return; if (getStatus(requestError) === 401) router.replace("/"); else setError(requestError instanceof Error ? requestError.message : "Unable to load batches."); }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading batches...</p></main>;

  return <WorkspaceShell activeItem="Batch List" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">WAREHOUSE OPERATIONS</p><h1>Batch List</h1><p className="intro-copy">Review stock-in batches and received quantities.</p></div><button className="primary-button compact-button" onClick={() => router.push("/stock-in")}>Create stock in <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Batches unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <BatchTable batches={batches} />}</WorkspaceShell>;
}

function BatchTable({ batches }: { batches: StockInRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{batches.length}</strong><span>stock-in batches</span></div><span className="data-badge">Received inventory</span></div><div className="permission-table-scroll"><table className="permission-table batch-table"><thead><tr><th>Batch ID</th><th>Master product</th><th>Color</th><th>Gender</th><th>Stock-in date</th><th>Production date</th><th>Quantity</th><th>Packages</th><th>Items</th></tr></thead><tbody>{batches.length === 0 ? <tr><td className="table-empty" colSpan={9}>No stock-in batches found.</td></tr> : batches.map((batch) => <tr key={batch.id}><td><strong>{batch.batchId}</strong><span className="module-key">#{batch.id}</span></td><td>{batch.masterProduct.name}<span className="module-key">{batch.masterProduct.sku}</span></td><td>{batch.color.name}</td><td>{batch.gender === "MALE" ? "Male" : "Female"}</td><td className="date-cell">{formatDate(batch.stockInDate)}</td><td className="date-cell">{formatDate(batch.productionDate)}</td><td className="role-number">{formatNumber(batch.totalQuantity)}</td><td className="role-number">{formatNumber(batch.totalPackages)}</td><td className="role-number">{batch.itemCount ?? batch.items?.length ?? 0}</td></tr>)}</tbody></table></div></section>;
}

function formatNumber(value: number) { return new Intl.NumberFormat("en-US").format(value); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }