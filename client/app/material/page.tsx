"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMaterials, getSession, logout, type MaterialRecord, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function MaterialPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getSession().then((currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      return getMaterials().then((response) => { if (isMounted) setMaterials(response.data); });
    }).catch((requestError) => {
      if (!isMounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load materials.");
    }).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading materials...</p></main>;

  return <WorkspaceShell activeItem="Material" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>Material</h1><p className="intro-copy">Manage materials available for your products.</p></div><button className="primary-button compact-button" onClick={() => router.push("/material/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Materials unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <MaterialTable materials={materials} />}</WorkspaceShell>;
}

function MaterialTable({ materials }: { materials: MaterialRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{materials.length}</strong><span>materials</span></div><span className="data-badge">Catalog attribute</span></div><div className="permission-table-scroll"><table className="permission-table material-table"><thead><tr><th>Id</th><th>Material</th><th>Description</th><th>Created</th></tr></thead><tbody>{materials.length === 0 ? <tr><td className="table-empty" colSpan={4}>No materials found.</td></tr> : materials.map((material) => <tr key={material.id}><td className="id-cell">{material.id}</td><td><span className="material-name"><i className="material-swatch" />{material.name}</span></td><td className="description-cell">{material.description || "No description"}</td><td className="date-cell">{formatDate(material.createdAt)}</td></tr>)}</tbody></table></div></section>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }