import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";
import { triggerSMSCampaign } from "@/lib/sms-campaigns";

// GET - List appointments for organization
export const GET = withOrgAuth(async (user, request: Request) => {
  const nextRequest = request as NextRequest;
  const searchParams = nextRequest.nextUrl.searchParams;
  
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: any = {
    organizationId: user.organizationId,
  };

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.appointment.count({ where }),
  ]);

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const stats = {
    total,
    today: await prisma.appointment.count({
      where: {
        organizationId: user.organizationId,
        date: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      },
    }),
    thisWeek: await prisma.appointment.count({
      where: {
        organizationId: user.organizationId,
        date: { gte: today, lt: weekEnd },
        status: { not: "CANCELLED" },
      },
    }),
    confirmed: await prisma.appointment.count({
      where: {
        organizationId: user.organizationId,
        status: "CONFIRMED",
      },
    }),
    cancelled: await prisma.appointment.count({
      where: {
        organizationId: user.organizationId,
        status: "CANCELLED",
      },
    }),
  };

  return NextResponse.json({
    appointments,
    stats,
    pagination: {
      total,
      limit,
      offset,
    },
  });
});

// POST - Create appointment manually
export const POST = withOrgAuth(async (user, request: Request) => {
  const body = await request.json();

  const {
    customerName,
    customerPhone,
    customerEmail,
    date,
    duration,
    serviceType,
    address,
    notes,
  } = body;

  if (!customerName || !date) {
    return NextResponse.json(
      { error: "Customer name and date are required" },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      customerName,
      customerPhone,
      customerEmail,
      date: new Date(date),
      duration: duration || 60,
      serviceType,
      address,
      notes,
      organizationId: user.organizationId,
      bookedVia: "MANUAL",
    },
  });

  return NextResponse.json({ appointment });
});

// PATCH - Update appointment status (trigger follow-ups)
export const PATCH = withOrgAuth(async (user, request: Request) => {
  const body = await request.json();
  const { appointmentId, status } = body;

  if (!appointmentId || !status) {
    return NextResponse.json({ error: "appointmentId and status are required" }, { status: 400 });
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existing || existing.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  // Trigger follow-up when completed
  if (status === "COMPLETED" && existing.status !== "COMPLETED") {
    try {
      await triggerSMSCampaign({
        type: "FOLLOW_UP",
        trigger: "APPOINTMENT_COMPLETED",
        appointmentId: appointmentId,
        organizationId: user.organizationId,
        delayHours: 24, // 24 hours after completion
      });
    } catch (err) {
      console.error("Failed to trigger SMS follow-up campaign", err);
    }
  }

  return NextResponse.json({ appointment: updated });
});

