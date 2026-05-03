/*
  Warnings:

  - A unique constraint covering the columns `[share_token]` on the table `friends` will be added. If there are existing duplicate values, this will fail.
  - The required column `share_token` was added to the `friends` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "friends" ADD COLUMN     "share_token" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "friends_share_token_key" ON "friends"("share_token");
