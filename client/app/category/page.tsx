"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories, getSession, logout, type CategoryRecord, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function CategoryPage() {
  return <CategoryList type="CATEGORY" title="Category" description="Manage top-level product categories." />;
}

function CategoryList({ type, title, description }: { type: "CATEGORY" | "SUB_CATEGORY"; title: string; description: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getSession().then((currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      return getCategories(type).then((response) => { if (isMounted) setCategories(response.data); });
    }).catch((requestError) => {
      if (!isMounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : `Unable to load ${title.toLowerCase()}s.`);
    }).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router, title, type]);

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading {title.toLowerCase()}s...</p></main>;

  return <WorkspaceShell activeItem={title} user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT ATTRIBUTES</p><h1>{title}</h1><p className="intro-copy">{description}</p></div><button className="primary-button compact-button" onClick={() => router.push(type === "CATEGORY" ? "/category/new" : "/sub-category/new")}>Create new <span aria-hidden="true">+</span></button></div>{error ? <section className="data-error panel"><h2>{title} data unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : <CategoryTable categories={categories} isSubCategory={type === "SUB_CATEGORY"} />}</WorkspaceShell>;
}

function CategoryTable({ categories, isSubCategory }: { categories: CategoryRecord[]; isSubCategory: boolean }) {
  return <section className="permission-table-wrap panel"><div className="table-summary"><div><strong>{categories.length}</strong><span>{isSubCategory ? "sub-categories" : "categories"}</span></div><span className="data-badge">{categories.filter((category) => category.status === "ACTIVE").length} active</span></div><div className="permission-table-scroll"><table className="permission-table category-table"><thead><tr><th>Id</th><th>Name</th>{isSubCategory && <th>Parent category</th>}<th>Slug</th><th>Status</th><th>Sort order</th>{!isSubCategory && <th>Children</th>}</tr></thead><tbody>{categories.length === 0 ? <tr><td className="table-empty" colSpan={isSubCategory ? 6 : 6}>No records found.</td></tr> : categories.map((category) => <tr key={category.id}><td className="id-cell">{category.id}</td><td><strong>{category.name}</strong><span className="module-key">{category.description || "No description"}</span></td>{isSubCategory && <td>{category.parent?.name || "-"}</td>}<td className="module-key">{category.slug}</td><td><span className={`role-status ${category.status.toLowerCase()}`}>{category.status}</span></td><td className="role-number">{category.sortOrder}</td>{!isSubCategory && <td className="role-number">{category.childrenCount}</td>}</tr>)}</tbody></table></div></section>;
}

export { CategoryList };
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }