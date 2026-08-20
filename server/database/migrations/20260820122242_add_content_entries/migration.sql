-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('NEWS', 'LORE');

-- CreateTable
CREATE TABLE "ContentEntry" (
    "id" SERIAL NOT NULL,
    "type" "ContentType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentEntry_type_createdAt_idx" ON "ContentEntry"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentEntry_type_slug_key" ON "ContentEntry"("type", "slug");
