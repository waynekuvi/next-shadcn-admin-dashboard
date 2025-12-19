-- Manual migration for SMS Campaigns
-- Run this SQL directly in your database if Prisma migrate is too slow

-- Create SMSCampaign table
CREATE TABLE IF NOT EXISTS "SMSCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "delayAfterTrigger" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMSCampaign_pkey" PRIMARY KEY ("id")
);

-- Create SMSMessage table
CREATE TABLE IF NOT EXISTS "SMSMessage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "delay" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SMSMessage_pkey" PRIMARY KEY ("id")
);

-- Create SMSExecution table
CREATE TABLE IF NOT EXISTS "SMSExecution" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "status" TEXT NOT NULL,
    "currentSequence" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL,
    "nextSendAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "deliveryStatus" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMSExecution_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SMSCampaign_organizationId_fkey'
    ) THEN
        ALTER TABLE "SMSCampaign" ADD CONSTRAINT "SMSCampaign_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SMSMessage_campaignId_fkey'
    ) THEN
        ALTER TABLE "SMSMessage" ADD CONSTRAINT "SMSMessage_campaignId_fkey" 
        FOREIGN KEY ("campaignId") REFERENCES "SMSCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SMSExecution_campaignId_fkey'
    ) THEN
        ALTER TABLE "SMSExecution" ADD CONSTRAINT "SMSExecution_campaignId_fkey" 
        FOREIGN KEY ("campaignId") REFERENCES "SMSCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SMSExecution_organizationId_fkey'
    ) THEN
        ALTER TABLE "SMSExecution" ADD CONSTRAINT "SMSExecution_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "SMSCampaign_organizationId_idx" ON "SMSCampaign"("organizationId");
CREATE INDEX IF NOT EXISTS "SMSCampaign_type_trigger_idx" ON "SMSCampaign"("type", "trigger");
CREATE INDEX IF NOT EXISTS "SMSMessage_campaignId_sequence_idx" ON "SMSMessage"("campaignId", "sequence");
CREATE INDEX IF NOT EXISTS "SMSExecution_organizationId_idx" ON "SMSExecution"("organizationId");
CREATE INDEX IF NOT EXISTS "SMSExecution_appointmentId_idx" ON "SMSExecution"("appointmentId");
CREATE INDEX IF NOT EXISTS "SMSExecution_status_nextSendAt_idx" ON "SMSExecution"("status", "nextSendAt");
CREATE INDEX IF NOT EXISTS "SMSExecution_campaignId_idx" ON "SMSExecution"("campaignId");

-- Add SMS fields to Organization table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Organization' AND column_name = 'smsEnabled') THEN
        ALTER TABLE "Organization" ADD COLUMN "smsEnabled" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Organization' AND column_name = 'smsReminderWebhookUrl') THEN
        ALTER TABLE "Organization" ADD COLUMN "smsReminderWebhookUrl" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Organization' AND column_name = 'smsFollowUpWebhookUrl') THEN
        ALTER TABLE "Organization" ADD COLUMN "smsFollowUpWebhookUrl" TEXT;
    END IF;
END $$;





