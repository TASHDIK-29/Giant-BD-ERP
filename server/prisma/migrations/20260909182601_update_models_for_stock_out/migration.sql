/*
  Warnings:

  - A unique constraint covering the columns `[stockOutId,batchId,productVariantId]` on the table `StockOutItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchId` to the `StockOutItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productVariantId` to the `StockOutItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StockOutItem_stockOutId_key";

-- AlterTable
ALTER TABLE "StockOutItem" ADD COLUMN     "batchId" TEXT NOT NULL,
ADD COLUMN     "productVariantId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "StockOutItem_batchId_idx" ON "StockOutItem"("batchId");

-- CreateIndex
CREATE INDEX "StockOutItem_productVariantId_idx" ON "StockOutItem"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "StockOutItem_stockOutId_batchId_productVariantId_key" ON "StockOutItem"("stockOutId", "batchId", "productVariantId");

-- AddForeignKey
ALTER TABLE "StockOutItem" ADD CONSTRAINT "StockOutItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
