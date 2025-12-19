import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";
import { triggerSMSCampaign } from "@/lib/sms-campaigns";

// POST - Test SMS campaign without actually sending
export const POST = withOrgAuth(async (user, request) => {
  const body = await request.json();
  const { appointmentId, type = "REMINDER" } = body;

  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId is required" }, { status: 400 });
  }

  // Get appointment
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId: user.organizationId,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  // Get organization to check if SMS is enabled
  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: {
      smsEnabled: true,
      smsReminderWebhookUrl: true,
      smsFollowUpWebhookUrl: true,
    },
  });

  if (!organization || !organization.smsEnabled) {
    return NextResponse.json(
      { error: "SMS is not enabled for this organization" },
      { status: 400 }
    );
  }

  // Get active campaign
  const trigger = type === "REMINDER" ? "APPOINTMENT_BOOKED" : "APPOINTMENT_COMPLETED";
  const campaign = await prisma.sMSCampaign.findFirst({
    where: {
      organizationId: user.organizationId,
      type: type === "REMINDER" ? "REMINDER" : "FOLLOW_UP",
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

  if (!campaign || campaign.messages.length === 0) {
    return NextResponse.json(
      { error: "No active campaign found. Create a campaign first." },
      { status: 404 }
    );
  }

  // Create execution record
  const execution = await prisma.sMSExecution.create({
    data: {
      campaignId: campaign.id,
      triggerType: "APPOINTMENT",
      triggerId: appointmentId,
      appointmentId: appointmentId,
      phoneNumber: appointment.customerPhone || "+1234567890",
      customerName: appointment.customerName,
      status: "PENDING",
      totalMessages: campaign.messages.length,
      nextSendAt: new Date(),
      organizationId: user.organizationId,
    },
  });

  // Simulate workflow execution (don't actually call webhook)
  // Instead, simulate immediate "sent" status for first message
  const firstMessage = campaign.messages[0];
  
  // Format variables
  const variables = {
    name: appointment.customerName,
    date: appointment.date.toISOString().split("T")[0],
    time: appointment.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    service: appointment.serviceType || "appointment",
    phone: appointment.customerPhone || "",
    address: appointment.address || "",
  };

  // Replace variables in message
  let messageText = firstMessage.message;
  Object.entries(variables).forEach(([key, value]) => {
    messageText = messageText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
  });

  // Simulate sending first message immediately
  await prisma.sMSExecution.update({
    where: { id: execution.id },
    data: {
      status: "SENT",
      deliveryStatus: {
        messageId: `test-msg-${Date.now()}`,
        status: "sent",
        timestamp: new Date().toISOString(),
      },
    },
  });

  // Return test result
  return NextResponse.json({
    success: true,
    message: "Test campaign executed (simulated)",
    execution: {
      id: execution.id,
      status: "SENT",
      message: messageText,
      variables,
      campaign: {
        name: campaign.name,
        type: campaign.type,
        totalMessages: campaign.messages.length,
      },
      note: "This is a test execution. No actual SMS was sent. No credits were used.",
    },
  });
});





