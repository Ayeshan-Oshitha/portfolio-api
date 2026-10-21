-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('EXAM', 'COURSE');

-- CreateTable
CREATE TABLE "certificate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CertificateType" NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "description" TEXT,
    "fileMediaId" TEXT,
    "issuerLogoMediaId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certificate_ownerId_idx" ON "certificate"("ownerId");

-- CreateIndex
CREATE INDEX "certificate_isPublished_type_isFeatured_sortOrder_idx" ON "certificate"("isPublished", "type", "isFeatured", "sortOrder");

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_fileMediaId_fkey" FOREIGN KEY ("fileMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_issuerLogoMediaId_fkey" FOREIGN KEY ("issuerLogoMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
