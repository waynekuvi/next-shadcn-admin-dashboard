-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "chatbotAvatars" JSONB,
ADD COLUMN     "chatbotBrandLogo" TEXT,
ADD COLUMN     "chatbotGradientEnd" TEXT,
ADD COLUMN     "chatbotGradientStart" TEXT;
