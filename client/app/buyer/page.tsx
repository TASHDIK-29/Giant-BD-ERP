"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getBuyers, getSession, logout, type BuyerRecord, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function BuyerPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      return getBuyers().then((response) => { if (mounted) setBuyers(response); });
    }).catch((requestError) => {
      if (!mounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load buyers.");
    }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading buyers...</p></main>;

  return <WorkspaceShell activeItem="Buyer" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">CUSTOMER RELATIONSHIP</p><h1>Buyer</h1><p className="intro-copy">Manage local and international buyers.</p></div><button className="primary-button compact-button" onClick={() => router.push("/buyer/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Buyers unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <BuyerTable buyers={buyers} />}</WorkspaceShell>;
}

function BuyerTable({ buyers }: { buyers: BuyerRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{buyers.length}</strong><span>buyers</span></div><span className="data-badge">{buyers.filter((buyer) => buyer.status === "ACTIVE").length} active</span></div><div className="permission-table-scroll"><table className="permission-table buyer-table"><thead><tr><th>Id</th><th>Buyer</th><th>Type</th><th>Status</th><th>LCs</th><th>POs</th></tr></thead><tbody>{buyers.length === 0 ? <tr><td className="table-empty" colSpan={6}>No buyers found.</td></tr> : buyers.map((buyer) => <tr key={buyer.id}><td className="id-cell">{buyer.id}</td><td><strong>{buyer.name}</strong></td><td><span className={`buyer-type ${buyer.type.toLowerCase()}`}>{buyer.type === "INTERNATIONAL" ? "International" : "Local"}</span></td><td><span className={`role-status ${buyer.status.toLowerCase()}`}>{buyer.status}</span></td><td className="role-number">{buyer.lettersOfCredit.length}</td><td className="role-number">{buyer.lettersOfCredit.reduce((total, lc) => total + lc.purchaseOrders.length, 0)}</td></tr>)}</tbody></table></div></section>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }