import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

const campaignSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["REMINDER", "FOLLOW_UP"]),
  trigger: z.enum(["APPOINTMENT_BOOKED", "APPOINTMENT_COMPLETED"]),
  isActive: z.boolean().default(true),
  isPaused: z.boolean().default(false),
});

const campaignUpdateSchema = campaignSchema.partial().extend({
  id: z.string().min(1),
});

export const GET = withOrgAuth(async (user) => {
  const campaigns = await prisma.sMSCampaign.findMany({
    where: { organizationId: user.organizationId },
    include: {
      messages: {
        orderBy: { sequence: "asc" },
      },
      _count: {
        select: { executions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
});

export const POST = withOrgAuth(async (user, request: Request) => {
  const body = await request.json();
  const parsed = campaignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const campaign = await prisma.sMSCampaign.create({
    data: {
      ...parsed.data,
      organizationId: user.organizationId,
    },
    include: { messages: true },
  });

  return NextResponse.json({ campaign }, { status: 201 });
});

export const PATCH = withOrgAuth(async (user, request: Request) => {
  const body = await request.json();
  const parsed = campaignUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const { id, ...data } = parsed.data;

  const existing = await prisma.sMSCampaign.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const updated = await prisma.sMSCampaign.update({
    where: { id },
    data,
    include: { messages: { orderBy: { sequence: "asc" } }, _count: { select: { executions: true } } },
  });

  return NextResponse.json({ campaign: updated });
});

export const DELETE = withOrgAuth(async (user, request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
  }

  const existing = await prisma.sMSCampaign.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  await prisma.sMSCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
});





