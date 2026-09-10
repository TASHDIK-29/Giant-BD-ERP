"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getColors, getSession, logout, type ColorRecord, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function ColorPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getSession().then((currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      return getColors().then((response) => { if (isMounted) setColors(response.data); });
    }).catch((requestError) => {
      if (!isMounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load colors.");
    }).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading colors...</p></main>;

  return <WorkspaceShell activeItem="Color" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>Color</h1><p className="intro-copy">Manage the colors available for product variants.</p></div><button className="primary-button compact-button" onClick={() => router.push("/color/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>Colors unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <ColorTable colors={colors} />}</WorkspaceShell>;
}

function ColorTable({ colors }: { colors: ColorRecord[] }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{colors.length}</strong><span>colors</span></div><span className="data-badge">Catalog attribute</span></div><div className="permission-table-scroll"><table className="permission-table color-table"><thead><tr><th>Id</th><th>Color</th><th>Description</th><th>Created</th></tr></thead><tbody>{colors.length === 0 ? <tr><td className="table-empty" colSpan={4}>No colors found.</td></tr> : colors.map((color) => <tr key={color.id}><td className="id-cell">{color.id}</td><td><span className="color-name"><i className="color-swatch" />{color.name}</span></td><td className="description-cell">{color.description || "No description"}</td><td className="date-cell">{formatDate(color.createdAt)}</td></tr>)}</tbody></table></div></section>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }