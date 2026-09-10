"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createStockIn, getColors, getMasterProducts, getProductVariants, getRacks, getSession, getSubZones, getWarehouses, getZones, logout, type ColorRecord, type MasterProductRecord, type ProductVariantRecord, type RackRecord, type Session, type SubZoneRecord, type WarehouseRecord, type ZoneRecord } from "../../lib/api";
import { WorkspaceShell } from "../../components/workspace-shell";

type Location = { warehouseId: string; zoneId: string; subZoneId: string; rackId: string };

export default function StockInPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<MasterProductRecord[]>([]);
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [variants, setVariants] = useState<ProductVariantRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [subZones, setSubZones] = useState<SubZoneRecord[]>([]);
  const [racks, setRacks] = useState<RackRecord[]>([]);
  const [masterProductId, setMasterProductId] = useState("");
  const [colorId, setColorId] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [stockInDate, setStockInDate] = useState(today());
  const [productionDate, setProductionDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [locations, setLocations] = useState<Record<string, Location>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      return Promise.all([getMasterProducts(1, 100), getColors(1, 100), getWarehouses(), getZones(), getSubZones(), getRacks()]).then(([productResponse, colorResponse, warehouseResponse, zoneResponse, subZoneResponse, rackResponse]) => {
        if (!mounted) return;
        setProducts(productResponse.data.filter((product) => product.status === "ACTIVE"));
        setColors(colorResponse.data);
        setWarehouses(warehouseResponse.data.filter((item) => item.status === "ACTIVE"));
        setZones(zoneResponse.data.filter((item) => item.status === "ACTIVE"));
        setSubZones(subZoneResponse.data.filter((item) => item.status === "ACTIVE"));
        setRacks(rackResponse.data.filter((item) => item.status === "ACTIVE"));
      });
    }).catch((requestError) => { if (mounted) { if (getStatus(requestError) === 401) router.replace("/"); else setError(requestError instanceof Error ? requestError.message : "Unable to load stock-in options."); } }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  useEffect(() => {
    if (!masterProductId || !colorId || !gender) return;
    let mounted = true;
    getProductVariants(1, 100, { masterProductId: Number(masterProductId), colorId: Number(colorId), gender }).then((response) => { if (mounted) { setVariants(response.data.filter((variant) => variant.status === "ACTIVE")); setQuantities({}); setLocations({}); } }).catch((requestError) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "Unable to load matching variants."); }).finally(() => { if (mounted) setIsLoadingVariants(false); });
    return () => { mounted = false; };
  }, [colorId, gender, masterProductId]);

  const selectedProduct = products.find((product) => String(product.id) === masterProductId);
  function updateLocation(size: string, key: keyof Location, value: string) {
    setLocations((current) => {
      const previous = current[size] ?? { warehouseId: "", zoneId: "", subZoneId: "", rackId: "" };
      const next = { ...previous, [key]: value };
      if (key === "warehouseId") { next.zoneId = ""; next.subZoneId = ""; next.rackId = ""; }
      if (key === "zoneId") { next.subZoneId = ""; next.rackId = ""; }
      if (key === "subZoneId") next.rackId = "";
      return { ...current, [size]: next };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!masterProductId || !colorId || variants.length === 0) return setError("Select a product, color, gender, and matching variants.");
    if (new Date(productionDate) > new Date(stockInDate)) return setError("Production date cannot be later than stock-in date.");
    if (expiryDate && new Date(expiryDate) <= new Date(productionDate)) return setError("Expiry date must be later than production date.");
    const items = variants.map((variant) => { const location = locations[variant.size]; return { size: variant.size, quantity: Number(quantities[variant.size]), warehouseId: Number(location?.warehouseId), zoneId: Number(location?.zoneId), subZoneId: Number(location?.subZoneId), rackId: Number(location?.rackId) }; });
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || !item.warehouseId || !item.zoneId || !item.subZoneId || !item.rackId)) return setError("Enter a positive quantity and complete location for every variant.");
    setError(""); setIsSaving(true);
    try { await createStockIn({ masterProductId: Number(masterProductId), colorId: Number(colorId), gender, stockInDate, productionDate, ...(expiryDate ? { expiryDate } : {}), items }); router.push("/batch-list"); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create stock in."); } finally { setIsSaving(false); }
  }

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading stock-in form...</p></main>;

  return <WorkspaceShell activeItem="Stock In" user={session.user} onLogout={handleLogout}><div className="page-intro"><div><p className="eyebrow">WAREHOUSE OPERATIONS</p><h1>Stock In</h1><p className="intro-copy">Receive finished goods into a specific warehouse location.</p></div></div><form className="stock-in-form" onSubmit={handleSubmit}><section className="panel form-section stock-header-form"><div className="form-section-heading"><div><p className="eyebrow">RECEIPT DETAILS</p><h2>Stock-in information</h2></div><span className="required-note">* Required</span></div><label htmlFor="stock-master">Master product</label><select id="stock-master" value={masterProductId} onChange={(event) => { setMasterProductId(event.target.value); setVariants([]); setIsLoadingVariants(true); }} required><option value="">Select active product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name} ({product.sku})</option>)}</select><label htmlFor="stock-color">Color</label><select id="stock-color" value={colorId} onChange={(event) => { setColorId(event.target.value); setVariants([]); setIsLoadingVariants(true); }} required><option value="">Select color</option>{colors.map((color) => <option value={color.id} key={color.id}>{color.name}</option>)}</select><label htmlFor="stock-gender">Gender</label><select id="stock-gender" value={gender} onChange={(event) => { setGender(event.target.value as "MALE" | "FEMALE"); setVariants([]); setIsLoadingVariants(true); }}><option value="MALE">Male</option><option value="FEMALE">Female</option></select><label>Material</label><div className="readonly-field">{selectedProduct?.material.name || "Select a master product"}</div><label>Products per packet</label><div className="readonly-field">{variants[0]?.productsPerPacket ?? "Select matching variants"}</div><label>Model number</label><div className="readonly-field">{variants[0]?.modelNumber || "-"}</div><label htmlFor="stock-in-date">Stock-in date</label><input id="stock-in-date" type="date" value={stockInDate} onChange={(event) => setStockInDate(event.target.value)} required /><label htmlFor="production-date">Production date</label><input id="production-date" type="date" value={productionDate} onChange={(event) => setProductionDate(event.target.value)} required /><label htmlFor="expiry-date">Expiry date</label><input id="expiry-date" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></section><section className="panel stock-items-section"><div className="form-section-heading"><div><p className="eyebrow">VARIANT LOCATIONS</p><h2>Quantity and storage</h2></div><span className="data-badge">{variants.length} variants</span></div>{isLoadingVariants ? <p className="empty-copy">Loading matching variants...</p> : variants.length === 0 ? <p className="empty-copy">Select master product, color, and gender to load variants.</p> : <StockItemsTable variants={variants} quantities={quantities} locations={locations} warehouses={warehouses} zones={zones} subZones={subZones} racks={racks} onQuantity={(size, value) => setQuantities((current) => ({ ...current, [size]: value }))} onLocation={updateLocation} />}</section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/batch-list")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving || variants.length === 0}>{isSaving ? "Creating..." : "Create stock in"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}

function StockItemsTable({ variants, quantities, locations, warehouses, zones, subZones, racks, onQuantity, onLocation }: { variants: ProductVariantRecord[]; quantities: Record<string, string>; locations: Record<string, Location>; warehouses: WarehouseRecord[]; zones: ZoneRecord[]; subZones: SubZoneRecord[]; racks: RackRecord[]; onQuantity: (size: string, value: string) => void; onLocation: (size: string, key: keyof Location, value: string) => void }) {
  return <div className="stock-items-table-wrap"><table className="stock-items-table"><thead><tr><th>Variant</th><th>Qty</th><th>Warehouse</th><th>Zone</th><th>Sub-zone</th><th>Rack</th></tr></thead><tbody>{variants.map((variant) => { const location = locations[variant.size] ?? { warehouseId: "", zoneId: "", subZoneId: "", rackId: "" }; const availableZones = zones.filter((zone) => String(zone.warehouseId) === location.warehouseId); const availableSubZones = subZones.filter((subZone) => String(subZone.zoneId) === location.zoneId); const availableRacks = racks.filter((rack) => String(rack.subZoneId) === location.subZoneId); return <tr key={variant.id}><td><strong>{variant.size}</strong><span>{variant.sku}</span></td><td><input className="quantity-input" type="number" min="1" step="1" value={quantities[variant.size] || ""} onChange={(event) => onQuantity(variant.size, event.target.value)} placeholder="0" /></td><td><select value={location.warehouseId} onChange={(event) => onLocation(variant.size, "warehouseId", event.target.value)}><option value="">Select</option>{warehouses.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></td><td><select value={location.zoneId} onChange={(event) => onLocation(variant.size, "zoneId", event.target.value)} disabled={!location.warehouseId}><option value="">Select</option>{availableZones.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></td><td><select value={location.subZoneId} onChange={(event) => onLocation(variant.size, "subZoneId", event.target.value)} disabled={!location.zoneId}><option value="">Select</option>{availableSubZones.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></td><td><select value={location.rackId} onChange={(event) => onLocation(variant.size, "rackId", event.target.value)} disabled={!location.subZoneId}><option value="">Select</option>{availableRacks.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></td></tr>; })}</tbody></table></div>;
}

function today() { return new Date().toISOString().slice(0, 10); }
function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }