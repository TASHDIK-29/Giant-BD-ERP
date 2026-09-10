"use client";

import { useRouter } from "next/navigation";

import type { Session } from "../lib/api";

const navigation = [
  { label: "Warehouse", items: ["Dashboard", "Stock In", "Stock Out", "Stock Out List", "Batch List"] },
  { label: "Product", items: ["Master FG Product", "Variant FG Product"] },
  { label: "CRM", items: ["Buyer"] },
  { label: "Attribute", items: ["Category", "Sub Category", "Material", "Color", "Warehouse", "Zone", "Sub Zone", "Rack"] },
  { label: "Role", items: ["Role"] },
  { label: "Permission", items: ["Permission"] },
  { label: "User", items: ["User"] },
];

const routes: Record<string, string> = {
  Dashboard: "/dashboard",
  "Stock In": "/stock-in",
  "Batch List": "/batch-list",
  "Stock Out": "/stock-out",
  "Stock Out List": "/stock-out-list",
  Category: "/category",
  "Sub Category": "/sub-category",
  Buyer: "/buyer",
  "Master FG Product": "/master-product",
  "Variant FG Product": "/variant-product",
  Material: "/material",
  Color: "/color",
  Warehouse: "/warehouse",
  Zone: "/zone",
  "Sub Zone": "/sub-zone",
  Rack: "/rack",
  Permission: "/permission",
  Role: "/role",
  User: "/user",
};

export function WorkspaceShell({ user, activeItem, onLogout, children, breadcrumb }: { user: Session["user"]; activeItem: string; onLogout: () => void; children: React.ReactNode; breadcrumb?: string }) {
  const router = useRouter();

  function navigate(item: string) {
    const route = routes[item];
    if (route) router.push(route);
  }

  return <main className="dashboard-page"><aside className="sidebar"><div className="sidebar-brand"><span className="brand-mark">G</span><span>GIANTBD <small>ERP</small></span></div><div className="sidebar-label">Workspace</div><nav aria-label="Main navigation">{navigation.map((section) => <div className="nav-section" key={section.label}><div className="nav-heading"><span className="nav-glyph" />{section.label}</div>{section.items.map((item) => <button className={`nav-item ${activeItem === item ? "is-active" : ""}`} key={item} onClick={() => navigate(item)}><span className="nav-item-marker" />{item}</button>)}</div>)}</nav><div className="sidebar-user"><div className="avatar">{getInitials(user.name)}</div><div><strong>{user.name}</strong><span>{user.role}</span></div><button aria-label="Sign out" onClick={onLogout}>↪</button></div></aside><section className="dashboard-content"><header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{breadcrumb ?? activeItem}</strong></div><div className="topbar-actions"><div className="top-avatar">{getInitials(user.name)}</div></div></header><div className="content-inner">{children}</div></section></main>;
}

function getInitials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }