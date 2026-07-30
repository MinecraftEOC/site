-- AlterEnum
ALTER TYPE "CharacterStatus" ADD VALUE 'UNAVAILABLE';

-- AlterTable: comment переименован — это комментарий модерации квенты
ALTER TABLE "Character" RENAME COLUMN "comment" TO "reviewComment";

-- AlterTable: комментарий к статусу и дата его последней смены
ALTER TABLE "Character" ADD COLUMN "statusComment" TEXT;
ALTER TABLE "Character" ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Существующим персонажам — момент последнего изменения записи
UPDATE "Character" SET "statusChangedAt" = "updatedAt";
