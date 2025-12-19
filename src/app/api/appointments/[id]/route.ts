import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

// GET - Get single appointment
export const GET = withOrgAuth(async (user, request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json({ appointment });
});

// PATCH - Update appointment
export const PATCH = withOrgAuth(async (user, request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const body = await request.json();

  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.customerName && { customerName: body.customerName }),
      ...(body.customerPhone !== undefined && { customerPhone: body.customerPhone }),
      ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
      ...(body.serviceType !== undefined && { serviceType: body.serviceType }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.duration && { duration: body.duration }),
    },
  });

  return NextResponse.json({ appointment: updatedAppointment });
});

// DELETE - Cancel/delete appointment
export const DELETE = withOrgAuth(async (user, request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  // Soft delete - just mark as cancelled
  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
});

