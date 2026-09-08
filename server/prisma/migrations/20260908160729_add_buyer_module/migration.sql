-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('LOCAL', 'INTERNATIONAL');

-- CreateTable
CREATE TABLE "Buyer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BuyerType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Buyer_type_idx" ON "Buyer"("type");

-- CreateIndex
CREATE INDEX "Buyer_status_idx" ON "Buyer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_name_type_key" ON "Buyer"("name", "type");
