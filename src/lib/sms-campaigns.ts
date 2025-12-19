import { prisma } from "@/lib/db";

type TriggerType = "REMINDER" | "FOLLOW_UP";
type TriggerEvent = "APPOINTMENT_BOOKED" | "APPOINTMENT_COMPLETED";

interface TriggerSMSCampaignParams {
  type: TriggerType;
  trigger: TriggerEvent;
  appointmentId: string;
  organizationId: string;
  delayHours?: number;
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function triggerSMSCampaign(params: TriggerSMSCampaignParams) {
  const { type, trigger, appointmentId, organizationId, delayHours = 0 } = params;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      smsEnabled: true,
      smsReminderWebhookUrl: true,
      smsFollowUpWebhookUrl: true,
    },
  });
  if (!organization || !organization.smsEnabled) return;

  const webhookUrl =
    type === "REMINDER" ? organization.smsReminderWebhookUrl : organization.smsFollowUpWebhookUrl;
  if (!webhookUrl) return;

  const campaign = await prisma.sMSCampaign.findFirst({
    where: {
      organizationId,
      type,
      trigger,
      isActive: true,
      isPaused: false,
    },
    include: {
      messages: {
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!campaign || campaign.messages.length === 0) return;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!appointment || !appointment.customerPhone) return;

  const execution = await prisma.sMSExecution.create({
    data: {
      campaignId: campaign.id,
      triggerType: "APPOINTMENT",
      triggerId: appointmentId,
      appointmentId: appointmentId,
      phoneNumber: appointment.customerPhone,
      customerName: appointment.customerName,
      status: "PENDING",
      totalMessages: campaign.messages.length,
      nextSendAt: delayHours > 0 ? addHours(new Date(), delayHours) : new Date(),
      organizationId,
    },
  });

  // Fire-and-forget to n8n
  const payload = {
    executionId: execution.id,
    campaignId: campaign.id,
    campaignName: campaign.name,
    phoneNumber: appointment.customerPhone,
    customerName: appointment.customerName,
    appointmentDate: appointment.date,
    serviceType: appointment.serviceType,
    variables: {
      name: appointment.customerName,
      date: appointment.date,
      time: appointment.date,
      service: appointment.serviceType || "appointment",
      phone: appointment.customerPhone,
      address: appointment.address,
    },
    messages: campaign.messages.map((m) => ({
      sequence: m.sequence,
      delay: m.delay,
      message: m.message,
    })),
    nextSendAt: execution.nextSendAt,
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("Failed to send SMS payload to n8n", err);
  });
}





