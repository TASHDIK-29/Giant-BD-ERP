"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createProductVariants, getColors, getMasterProducts, getSession, logout, type ColorRecord, type MasterProductRecord, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

const genders = ["MALE", "FEMALE"] as const;
const uoms = ["PCS", "PAIR", "LEFT", "RIGHT", "KG", "GRAM", "LITER", "ML", "BOX", "PACK", "SET"];
const packagingTypes = ["BOX", "CARTON", "PACKET", "POLYBAG", "BUNDLE"];

export default function NewVariantProductPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<MasterProductRecord[]>([]);
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [masterProductId, setMasterProductId] = useState("");
  const [colorId, setColorId] = useState("");
  const [gender, setGender] = useState<(typeof genders)[number]>("MALE");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [uom, setUom] = useState("PCS");
  const [productsPerPacket, setProductsPerPacket] = useState("1");
  const [packagingType, setPackagingType] = useState("PACKET");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      return Promise.all([getMasterProducts(1, 100), getColors(1, 100)]).then(([productResponse, colorResponse]) => {
        if (!mounted) return;
        setProducts(productResponse.data.filter((product) => product.status === "ACTIVE"));
        setColors(colorResponse.data);
      });
    }).catch((requestError) => {
      if (!mounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load variant options.");
    }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  function addSize() {
    const nextSize = sizeInput.trim();
    if (!nextSize) return setError("Enter a size before adding it.");
    if (sizes.some((size) => size.toLowerCase() === nextSize.toLowerCase())) return setError("That size has already been added.");
    setSizes((current) => [...current, nextSize]);
    setSizeInput("");
    setError("");
  }

  function removeSize(sizeToRemove: string) { setSizes((current) => current.filter((size) => size !== sizeToRemove)); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!masterProductId || !colorId || sizes.length === 0 || !uom || !packagingType) { setError("Master product, color, sizes, unit, and packaging type are required."); return; }
    const packetCount = Number(productsPerPacket);
    if (!Number.isInteger(packetCount) || packetCount < 1) { setError("Products per packet must be a positive whole number."); return; }
    setError(""); setIsSaving(true);
    try { await createProductVariants({ masterProductId: Number(masterProductId), colorId: Number(colorId), gender, sizes, modelNumber: modelNumber.trim() || undefined, uom, productsPerPacket: packetCount, packagingType }); router.push("/variant-product"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create product variants."); }
    finally { setIsSaving(false); }
  }

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading variant form...</p></main>;

  return <WorkspaceShell activeItem="Variant FG Product" breadcrumb="Variant FG Product / New" user={session.user} onLogout={handleLogout}>
    <div className="page-intro permission-intro"><div><p className="eyebrow">PRODUCT CATALOG</p><h1>New Variant FG Product</h1><p className="intro-copy">Create variants for an active master product.</p></div></div>
    <form className="permission-form variant-form" onSubmit={handleSubmit}>
      <section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">VARIANT IDENTITY</p><h2>Product combination</h2></div><span className="required-note">* Required</span></div><label htmlFor="variant-master">Master product</label><select id="variant-master" value={masterProductId} onChange={(event) => setMasterProductId(event.target.value)} required><option value="">Select master product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name} ({product.sku})</option>)}</select><label htmlFor="variant-color">Color</label><select id="variant-color" value={colorId} onChange={(event) => setColorId(event.target.value)} required><option value="">Select color</option>{colors.map((color) => <option value={color.id} key={color.id}>{color.name}</option>)}</select><label htmlFor="variant-gender">Gender</label><select id="variant-gender" value={gender} onChange={(event) => setGender(event.target.value as (typeof genders)[number])}>{genders.map((value) => <option value={value} key={value}>{value === "MALE" ? "Male" : "Female"}</option>)}</select><label htmlFor="variant-size-input">Sizes</label><div className="size-entry"><input id="variant-size-input" value={sizeInput} onChange={(event) => setSizeInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSize(); } }} placeholder="e.g. S" maxLength={50} /><button type="button" className="outline-button" onClick={addSize}>Add</button></div>{sizes.length > 0 && <div className="size-list" aria-label="Added sizes">{sizes.map((size) => <span className="size-chip" key={size}>{size}<button type="button" aria-label={`Remove size ${size}`} onClick={() => removeSize(size)}>x</button></span>)}</div>}<p className="field-hint">Add each size separately. One variant is created for every added size.</p></section>
      <section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">PACKAGING</p><h2>Fulfilment details</h2></div></div><label htmlFor="variant-model">Model number</label><input id="variant-model" value={modelNumber} onChange={(event) => setModelNumber(event.target.value)} placeholder="Optional" maxLength={100} /><label htmlFor="variant-uom">Unit of measure</label><select id="variant-uom" value={uom} onChange={(event) => setUom(event.target.value)}>{uoms.map((value) => <option value={value} key={value}>{value}</option>)}</select><label htmlFor="variant-count">Products per packet</label><input id="variant-count" type="number" min="1" step="1" value={productsPerPacket} onChange={(event) => setProductsPerPacket(event.target.value)} required /><label htmlFor="variant-packaging">Packaging type</label><select id="variant-packaging" value={packagingType} onChange={(event) => setPackagingType(event.target.value)}>{packagingTypes.map((value) => <option value={value} key={value}>{value}</option>)}</select></section>
      {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/variant-product")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving || products.length === 0 || colors.length === 0}>{isSaving ? "Creating..." : "Create variants"}<span aria-hidden="true">-&gt;</span></button></div>
    </form>
  </WorkspaceShell>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }