-- AlterTable
ALTER TABLE "article" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "article_ownerId_sortOrder_idx" ON "article"("ownerId", "sortOrder");
