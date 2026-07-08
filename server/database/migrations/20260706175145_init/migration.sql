-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('UNVERIFIED', 'RETURNED', 'ACTIVE', 'BANNED', 'DEAD');

-- CreateEnum
CREATE TYPE "DiscordLinkStatus" AS ENUM ('PENDING', 'LINKED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordAccount" (
    "id" SERIAL NOT NULL,
    "discordId" TEXT,
    "username" TEXT,
    "avatar" TEXT,
    "status" "DiscordLinkStatus" NOT NULL DEFAULT 'PENDING',
    "verifyCode" TEXT,
    "verifyExpiry" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DiscordAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accessToken" TEXT,
    "serverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "biography" TEXT NOT NULL,
    "states" JSONB NOT NULL,
    "startingItems" JSONB NOT NULL,
    "status" "CharacterStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "comment" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skin" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,

    CONSTRAINT "Skin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordAccount_discordId_key" ON "DiscordAccount"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordAccount_userId_key" ON "DiscordAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_uuid_key" ON "Character"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Character_username_key" ON "Character"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Skin_hash_key" ON "Skin"("hash");

-- AddForeignKey
ALTER TABLE "DiscordAccount" ADD CONSTRAINT "DiscordAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skin" ADD CONSTRAINT "Skin_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
