-- CreateTable
CREATE TABLE "LetterOfCredit" (
    "id" SERIAL NOT NULL,
    "lcNumber" TEXT NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterOfCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" SERIAL NOT NULL,
    "poNumber" TEXT NOT NULL,
    "letterOfCreditId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LetterOfCredit_lcNumber_key" ON "LetterOfCredit"("lcNumber");

-- CreateIndex
CREATE INDEX "LetterOfCredit_buyerId_idx" ON "LetterOfCredit"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "LetterOfCredit_buyerId_lcNumber_key" ON "LetterOfCredit"("buyerId", "lcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_letterOfCreditId_idx" ON "PurchaseOrder"("letterOfCreditId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_letterOfCreditId_poNumber_key" ON "PurchaseOrder"("letterOfCreditId", "poNumber");

-- AddForeignKey
ALTER TABLE "LetterOfCredit" ADD CONSTRAINT "LetterOfCredit_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_letterOfCreditId_fkey" FOREIGN KEY ("letterOfCreditId") REFERENCES "LetterOfCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
