-- CreateEnum
CREATE TYPE "CrewRole" AS ENUM ('CAMERAMAN', 'AUDIOMAN', 'OPERATOR', 'MIC_MAN', 'RUNNER', 'DIRECTOR', 'TALENT', 'VIDEO', 'EDITOR', 'PRODUCER', 'FLOOR', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('CAMERA', 'AUDIO', 'LIGHTING', 'ELECTRICAL', 'VIDEO', 'LAPTOP', 'PC', 'OTHER');

-- CreateTable
CREATE TABLE "CrewMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "CrewRole" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionCrewAssignment" (
    "productionId" TEXT NOT NULL,
    "crewMemberId" TEXT NOT NULL,

    CONSTRAINT "ProductionCrewAssignment_pkey" PRIMARY KEY ("productionId","crewMemberId")
);

-- CreateTable
CREATE TABLE "ProductionEquipmentAssignment" (
    "productionId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductionEquipmentAssignment_pkey" PRIMARY KEY ("productionId","equipmentId")
);

-- CreateIndex
CREATE INDEX "CrewMember_userId_idx" ON "CrewMember"("userId");

-- CreateIndex
CREATE INDEX "Equipment_userId_idx" ON "Equipment"("userId");

-- AddForeignKey
ALTER TABLE "ProductionCrewAssignment" ADD CONSTRAINT "ProductionCrewAssignment_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionCrewAssignment" ADD CONSTRAINT "ProductionCrewAssignment_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "CrewMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEquipmentAssignment" ADD CONSTRAINT "ProductionEquipmentAssignment_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEquipmentAssignment" ADD CONSTRAINT "ProductionEquipmentAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
