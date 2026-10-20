-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconSlug" TEXT,
    "color" TEXT,
    "iconMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_key" ON "tag"("slug");

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_iconMediaId_fkey" FOREIGN KEY ("iconMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
