"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getDashboard, getSession, logout, type DashboardData, type Session } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        return getDashboard().then((dashboardData) => {
          if (isMounted) setDashboard(dashboardData);
        });
      })
      .catch((requestError) => {
        if (!isMounted) return;
        if (requestError instanceof Error && "status" in requestError && (requestError as { status?: number }).status === 401) {
          router.replace("/");
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard data.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/");
    }
  }

  if (isLoading || !session) {
    return <main className="session-loading"><span className="brand-mark">G</span><p>Loading your workspace...</p></main>;
  }

  return <WorkspaceShell activeItem="Dashboard" user={session.user} onLogout={handleLogout}>
    <div className="page-intro"><div><p className="eyebrow">{formatToday()}</p><h1>Dashboard</h1><p className="intro-copy">Here is what is happening across your operation today.</p></div><button className="outline-button">Download report <span aria-hidden="true">↓</span></button></div>
    {error ? <section className="data-error panel"><h2>Dashboard data unavailable</h2><p>{error}</p><button className="outline-button" onClick={() => window.location.reload()}>Try again</button></section> : dashboard ? <DashboardOverview data={dashboard} /> : null}
  </WorkspaceShell>;
}

function DashboardOverview({ data }: { data: DashboardData }) {
  const totalStockIn = data.stockMovementLast30Days.reduce((total, day) => total + day.stockIn, 0);
  const totalStockOut = data.stockMovementLast30Days.reduce((total, day) => total + day.stockOut, 0);
  const maxMovement = Math.max(1, ...data.stockMovementLast30Days.flatMap((day) => [day.stockIn, day.stockOut]));
  const latestMovement = data.stockMovementLast30Days.at(-1);

  return <>
    <div className="metric-grid">
      <MetricCard label="Stock in · 30 days" value={formatNumber(totalStockIn)} detail={latestMovement ? `${formatNumber(latestMovement.stockIn)} today` : "No movement"} tone="green" />
      <MetricCard label="Stock out · 30 days" value={formatNumber(totalStockOut)} detail={latestMovement ? `${formatNumber(latestMovement.stockOut)} today` : "No movement"} tone="blue" />
      <MetricCard label="Master products" value={formatNumber(data.totals.masterProducts)} detail={`${formatNumber(data.totals.variants)} variants`} tone="orange" />
    </div>
    <div className="dashboard-grid">
      <MovementPanel data={data} maxMovement={maxMovement} />
      <StatusPanel status={data.stockOutStatus} />
    </div>
    <div className="dashboard-grid lower-grid">
      <BatchPanel batches={data.batches} />
      <TotalsPanel totals={data.totals} />
    </div>
    <div className="dashboard-grid lower-grid">
      <ProductTable title="Stock in by master product" rows={data.stockInByMasterProduct.map((row) => ({ name: row.masterProductName, sku: row.masterProductSku, value: row.quantity }))} valueLabel="Quantity" />
      <ProductTable title="Variants per master product" rows={data.variantsPerMasterProduct.map((row) => ({ name: row.masterProductName, sku: row.masterProductSku, value: row.variantCount }))} valueLabel="Variants" />
    </div>
  </>;
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><span /></div><p>{label}</p><strong>{value}</strong><span className={`metric-change ${tone}`}>{detail}</span></article>;
}

function MovementPanel({ data, maxMovement }: { data: DashboardData; maxMovement: number }) {
  const chartDays = data.stockMovementLast30Days.filter((_, index) => index % 5 === 0 || index === data.stockMovementLast30Days.length - 1);
  return <section className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">LAST 30 DAYS</p><h2>Stock movement</h2></div><span className="data-badge">{formatNumber(data.stockMovementLast30Days.length)} days</span></div><div className="bar-chart" aria-label="Stock in and stock out over the last 30 days">{data.stockMovementLast30Days.map((day) => <div className="bar-day" key={day.date} title={`${formatDate(day.date)}: ${day.stockIn} in, ${day.stockOut} out`}><div className="bar-pair"><span className="bar bar-in" style={{ height: `${Math.max(day.stockIn ? 4 : 0, (day.stockIn / maxMovement) * 100)}%` }} /><span className="bar bar-out" style={{ height: `${Math.max(day.stockOut ? 4 : 0, (day.stockOut / maxMovement) * 100)}%` }} /></div></div>)}</div><div className="chart-labels movement-labels">{chartDays.map((day) => <span key={day.date}>{formatShortDate(day.date)}</span>)}</div><div className="legend"><span><i className="legend-blue" />Stock in</span><span><i className="legend-orange" />Stock out</span></div></section>;
}

function StatusPanel({ status }: { status: DashboardData["stockOutStatus"] }) {
  const total = status.issued + status.delivered + status.received;
  return <section className="panel status-panel"><div className="panel-heading"><div><p className="eyebrow">STOCK OUT</p><h2>Order status</h2></div><span className="data-badge">{formatNumber(total)} total</span></div><div className="status-donut" style={{ background: `conic-gradient(#df8651 0 ${percentage(status.issued, total)}%, #4e956c ${percentage(status.issued, total)}% ${percentage(status.issued + status.delivered, total)}%, #528ab3 ${percentage(status.issued + status.delivered, total)}% 100%)` }}><div><strong>{formatNumber(total)}</strong><span>orders</span></div></div><div className="status-list"><StatusRow label="Issued" value={status.issued} tone="orange" /><StatusRow label="Delivered" value={status.delivered} tone="green" /><StatusRow label="Received" value={status.received} tone="blue" /></div></section>;
}

function StatusRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="status-row"><span><i className={`status-dot ${tone}`} />{label}</span><strong>{formatNumber(value)}</strong></div>;
}

function BatchPanel({ batches }: { batches: DashboardData["batches"] }) {
  return <section className="panel batch-panel"><div className="panel-heading"><div><p className="eyebrow">STOCK IN ACTIVITY</p><h2>Batch counts</h2></div></div><div className="batch-grid"><BatchStat label="Today" value={batches.today} /><BatchStat label="Yesterday" value={batches.yesterday} /><BatchStat label="This week" value={batches.thisWeek} /><BatchStat label="This month" value={batches.thisMonth} /></div></section>;
}

function BatchStat({ label, value }: { label: string; value: number }) {
  return <div className="batch-stat"><strong>{formatNumber(value)}</strong><span>{label}</span></div>;
}

function TotalsPanel({ totals }: { totals: DashboardData["totals"] }) {
  return <section className="panel batch-panel"><div className="panel-heading"><div><p className="eyebrow">CATALOG OVERVIEW</p><h2>Catalog totals</h2></div></div><div className="total-list"><TotalRow label="Master products" value={totals.masterProducts} /><TotalRow label="Variants" value={totals.variants} /><TotalRow label="Colors" value={totals.colors} /><TotalRow label="Materials" value={totals.materials} /></div></section>;
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return <div className="total-row"><span>{label}</span><strong>{formatNumber(value)}</strong></div>;
}

function ProductTable({ title, rows, valueLabel }: { title: string; rows: Array<{ name: string; sku: string; value: number }>; valueLabel: string }) {
  return <section className="panel product-panel"><div className="panel-heading"><div><p className="eyebrow">PRODUCTS</p><h2>{title}</h2></div><span className="data-badge">{rows.length} items</span></div>{rows.length === 0 ? <p className="empty-copy">No product data available yet.</p> : <div className="product-table"><div className="product-table-head"><span>Product</span><span>{valueLabel}</span></div>{rows.slice(0, 6).map((row) => <div className="product-row" key={`${row.sku}-${row.name}`}><div><strong>{row.name}</strong><span>{row.sku}</span></div><b>{formatNumber(row.value)}</b></div>)}</div>}</section>;
}

function formatNumber(value: number) { return new Intl.NumberFormat("en-US").format(value); }
function percentage(value: number, total: number) { return total ? (value / total) * 100 : 0; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatShortDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatToday() { return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase(); }
