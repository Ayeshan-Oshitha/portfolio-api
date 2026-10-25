-- AlterTable
ALTER TABLE "article" ADD COLUMN     "externalUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
