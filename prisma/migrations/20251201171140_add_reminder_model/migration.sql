-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "reminderType" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "showedUp" BOOLEAN,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_organizationId_idx" ON "Reminder"("organizationId");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
