-- AlterTable
ALTER TABLE "Character" ADD COLUMN "activeSkinId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Character_activeSkinId_key" ON "Character"("activeSkinId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_activeSkinId_fkey" FOREIGN KEY ("activeSkinId") REFERENCES "Skin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: активным становится первый загруженный скин. Симлинки в
-- storage/active создаёт скрипт `bun run skins:link` — из SQL файлы не создать.
UPDATE "Character" AS c
SET "activeSkinId" = s."firstSkinId"
FROM (
    SELECT "characterId", MIN("id") AS "firstSkinId"
    FROM "Skin"
    GROUP BY "characterId"
) AS s
WHERE s."characterId" = c."id";
