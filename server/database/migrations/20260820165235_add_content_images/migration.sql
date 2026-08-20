-- CreateTable
CREATE TABLE "ContentImage" (
    "id" SERIAL NOT NULL,
    "file" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entryId" INTEGER NOT NULL,

    CONSTRAINT "ContentImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentImage_file_key" ON "ContentImage"("file");

-- CreateIndex
CREATE INDEX "ContentImage_entryId_idx" ON "ContentImage"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentImage_entryId_name_key" ON "ContentImage"("entryId", "name");

-- AddForeignKey
ALTER TABLE "ContentImage" ADD CONSTRAINT "ContentImage_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
