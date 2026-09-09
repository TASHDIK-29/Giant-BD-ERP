/*
  Warnings:

  - You are about to drop the column `inventoryBatchId` on the `StockOutItem` table. All the data in the column will be lost.
  - You are about to drop the `InventoryBatch` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stockOutId]` on the table `StockOutItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "InventoryBatch" DROP CONSTRAINT "InventoryBatch_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryBatch" DROP CONSTRAINT "InventoryBatch_stockInItemId_fkey";

-- DropForeignKey
ALTER TABLE "StockOutItem" DROP CONSTRAINT "StockOutItem_inventoryBatchId_fkey";

-- DropIndex
DROP INDEX "StockOutItem_inventoryBatchId_idx";

-- DropIndex
DROP INDEX "StockOutItem_stockOutId_inventoryBatchId_key";

-- AlterTable
ALTER TABLE "StockOutItem" DROP COLUMN "inventoryBatchId";

-- DropTable
DROP TABLE "InventoryBatch";

-- CreateIndex
CREATE UNIQUE INDEX "StockOutItem_stockOutId_key" ON "StockOutItem"("stockOutId");
