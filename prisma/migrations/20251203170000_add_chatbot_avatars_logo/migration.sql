-- AlterTable
ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "chatbotAvatars" TEXT,
ADD COLUMN IF NOT EXISTS "chatbotBrandLogo" TEXT;
