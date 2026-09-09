-- CreateTable
CREATE TABLE "StockIn" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "masterProductId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "stockInDate" TIMESTAMP(3) NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "totalQuantity" INTEGER NOT NULL,
    "totalPackages" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockInItem" (
    "id" SERIAL NOT NULL,
    "stockInId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "subZoneId" INTEGER NOT NULL,
    "rackId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockInItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "subZoneId" INTEGER NOT NULL,
    "rackId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockIn_batchId_key" ON "StockIn"("batchId");

-- CreateIndex
CREATE INDEX "StockIn_masterProductId_idx" ON "StockIn"("masterProductId");

-- CreateIndex
CREATE INDEX "StockIn_colorId_idx" ON "StockIn"("colorId");

-- CreateIndex
CREATE INDEX "StockIn_createdById_idx" ON "StockIn"("createdById");

-- CreateIndex
CREATE INDEX "StockIn_stockInDate_idx" ON "StockIn"("stockInDate");

-- CreateIndex
CREATE INDEX "StockInItem_stockInId_idx" ON "StockInItem"("stockInId");

-- CreateIndex
CREATE INDEX "StockInItem_productVariantId_idx" ON "StockInItem"("productVariantId");

-- CreateIndex
CREATE INDEX "StockInItem_warehouseId_idx" ON "StockInItem"("warehouseId");

-- CreateIndex
CREATE INDEX "StockInItem_zoneId_idx" ON "StockInItem"("zoneId");

-- CreateIndex
CREATE INDEX "StockInItem_subZoneId_idx" ON "StockInItem"("subZoneId");

-- CreateIndex
CREATE INDEX "StockInItem_rackId_idx" ON "StockInItem"("rackId");

-- CreateIndex
CREATE UNIQUE INDEX "StockInItem_stockInId_productVariantId_warehouseId_zoneId_s_key" ON "StockInItem"("stockInId", "productVariantId", "warehouseId", "zoneId", "subZoneId", "rackId");

-- CreateIndex
CREATE INDEX "Inventory_productVariantId_idx" ON "Inventory"("productVariantId");

-- CreateIndex
CREATE INDEX "Inventory_warehouseId_idx" ON "Inventory"("warehouseId");

-- CreateIndex
CREATE INDEX "Inventory_zoneId_idx" ON "Inventory"("zoneId");

-- CreateIndex
CREATE INDEX "Inventory_subZoneId_idx" ON "Inventory"("subZoneId");

-- CreateIndex
CREATE INDEX "Inventory_rackId_idx" ON "Inventory"("rackId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productVariantId_warehouseId_zoneId_subZoneId_rac_key" ON "Inventory"("productVariantId", "warehouseId", "zoneId", "subZoneId", "rackId");

-- AddForeignKey
ALTER TABLE "StockIn" ADD CONSTRAINT "StockIn_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIn" ADD CONSTRAINT "StockIn_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIn" ADD CONSTRAINT "StockIn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_stockInId_fkey" FOREIGN KEY ("stockInId") REFERENCES "StockIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_subZoneId_fkey" FOREIGN KEY ("subZoneId") REFERENCES "SubZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_subZoneId_fkey" FOREIGN KEY ("subZoneId") REFERENCES "SubZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
