-- AlterTable
ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "chatbotGradientColor1" TEXT DEFAULT '#1e5eff',
ADD COLUMN IF NOT EXISTS "chatbotGradientColor2" TEXT DEFAULT '#5860f4',
ADD COLUMN IF NOT EXISTS "chatbotGradientColor3" TEXT DEFAULT '#7c3aed',
ADD COLUMN IF NOT EXISTS "chatbotGradientColor4" TEXT DEFAULT '#dcd6ff';
