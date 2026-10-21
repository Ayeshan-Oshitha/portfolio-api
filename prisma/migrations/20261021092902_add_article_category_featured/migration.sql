-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('TECH', 'PERSONAL');

-- AlterTable
ALTER TABLE "article" ADD COLUMN     "category" "ArticleCategory" NOT NULL DEFAULT 'TECH',
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "article_isPublished_category_isFeatured_idx" ON "article"("isPublished", "category", "isFeatured");
