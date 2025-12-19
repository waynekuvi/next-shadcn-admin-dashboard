/*
  Warnings:

  - You are about to drop the column `chatbotConfig` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "chatbotConfig",
ADD COLUMN     "chatbotEmbedCode" TEXT;
