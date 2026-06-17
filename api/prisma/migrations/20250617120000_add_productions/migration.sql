-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3),
    "status" "ProductionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunSheetItem" (
    "id" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "notes" TEXT,

    CONSTRAINT "RunSheetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Production_userId_idx" ON "Production"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RunSheetItem_productionId_sequence_key" ON "RunSheetItem"("productionId", "sequence");

-- AddForeignKey
ALTER TABLE "RunSheetItem" ADD CONSTRAINT "RunSheetItem_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE;
