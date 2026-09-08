-- CreateEnum
CREATE TYPE "Uom" AS ENUM ('PCS', 'PAIR', 'LEFT', 'RIGHT', 'KG', 'GRAM', 'LITER', 'ML', 'BOX', 'PACK', 'SET');

-- CreateEnum
CREATE TYPE "PackagingType" AS ENUM ('BOX', 'CARTON', 'PACKET', 'POLYBAG', 'BUNDLE');

-- CreateTable
CREATE TABLE "MasterProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER,
    "materialId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "masterProductId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "size" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "modelNumber" TEXT,
    "uom" "Uom" NOT NULL,
    "productsPerPacket" INTEGER NOT NULL,
    "packagingType" "PackagingType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_sku_key" ON "MasterProduct"("sku");

-- CreateIndex
CREATE INDEX "MasterProduct_categoryId_idx" ON "MasterProduct"("categoryId");

-- CreateIndex
CREATE INDEX "MasterProduct_subCategoryId_idx" ON "MasterProduct"("subCategoryId");

-- CreateIndex
CREATE INDEX "MasterProduct_materialId_idx" ON "MasterProduct"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_masterProductId_idx" ON "ProductVariant"("masterProductId");

-- CreateIndex
CREATE INDEX "ProductVariant_colorId_idx" ON "ProductVariant"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_masterProductId_colorId_gender_size_key" ON "ProductVariant"("masterProductId", "colorId", "gender", "size");

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
