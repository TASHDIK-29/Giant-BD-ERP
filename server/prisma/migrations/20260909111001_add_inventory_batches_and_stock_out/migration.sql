-- CreateEnum
CREATE TYPE "StockOutStatus" AS ENUM ('ISSUED', 'DELIVERED', 'RECEIVED');

-- CreateTable
CREATE TABLE "InventoryBatch" (
    "id" SERIAL NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "stockInItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockOut" (
    "id" SERIAL NOT NULL,
    "stockOutNumber" TEXT NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "letterOfCreditId" INTEGER NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "masterProductId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "stockOutDate" TIMESTAMP(3),
    "status" "StockOutStatus" NOT NULL DEFAULT 'ISSUED',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockOutItem" (
    "id" SERIAL NOT NULL,
    "stockOutId" INTEGER NOT NULL,
    "inventoryBatchId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOutItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryBatch_inventoryId_idx" ON "InventoryBatch"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryBatch_stockInItemId_idx" ON "InventoryBatch"("stockInItemId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryBatch_inventoryId_stockInItemId_key" ON "InventoryBatch"("inventoryId", "stockInItemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockOut_stockOutNumber_key" ON "StockOut"("stockOutNumber");

-- CreateIndex
CREATE INDEX "StockOut_buyerId_idx" ON "StockOut"("buyerId");

-- CreateIndex
CREATE INDEX "StockOut_letterOfCreditId_idx" ON "StockOut"("letterOfCreditId");

-- CreateIndex
CREATE INDEX "StockOut_purchaseOrderId_idx" ON "StockOut"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "StockOut_masterProductId_idx" ON "StockOut"("masterProductId");

-- CreateIndex
CREATE INDEX "StockOut_colorId_idx" ON "StockOut"("colorId");

-- CreateIndex
CREATE INDEX "StockOut_status_idx" ON "StockOut"("status");

-- CreateIndex
CREATE INDEX "StockOut_createdById_idx" ON "StockOut"("createdById");

-- CreateIndex
CREATE INDEX "StockOut_requestDate_idx" ON "StockOut"("requestDate");

-- CreateIndex
CREATE INDEX "StockOutItem_stockOutId_idx" ON "StockOutItem"("stockOutId");

-- CreateIndex
CREATE INDEX "StockOutItem_inventoryBatchId_idx" ON "StockOutItem"("inventoryBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "StockOutItem_stockOutId_inventoryBatchId_key" ON "StockOutItem"("stockOutId", "inventoryBatchId");

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_stockInItemId_fkey" FOREIGN KEY ("stockInItemId") REFERENCES "StockInItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_letterOfCreditId_fkey" FOREIGN KEY ("letterOfCreditId") REFERENCES "LetterOfCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutItem" ADD CONSTRAINT "StockOutItem_stockOutId_fkey" FOREIGN KEY ("stockOutId") REFERENCES "StockOut"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutItem" ADD CONSTRAINT "StockOutItem_inventoryBatchId_fkey" FOREIGN KEY ("inventoryBatchId") REFERENCES "InventoryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
