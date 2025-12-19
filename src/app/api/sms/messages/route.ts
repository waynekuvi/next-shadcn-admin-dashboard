import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

const messageSchema = z.object({
  campaignId: z.string().min(1),
  sequence: z.number().int().min(1),
  delay: z.number().min(0),
  message: z.string().min(1),
});

const messageUpdateSchema = messageSchema.partial().extend({
  id: z.string().min(1),
});

export const POST = withOrgAuth(async (user, request: Request) => {
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const campaign = await prisma.sMSCampaign.findFirst({
    where: { id: parsed.data.campaignId, organizationId: user.organizationId },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const message = await prisma.sMSMessage.create({
    data: parsed.data,
  });

  return NextResponse.json({ message }, { status: 201 });
});

export const PATCH = withOrgAuth(async (user, request: Request) => {
  const body = await request.json();
  const parsed = messageUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const { id, ...data } = parsed.data;

  const message = await prisma.sMSMessage.findFirst({
    where: { id },
    include: { campaign: true },
  });

  if (!message || message.campaign.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const updated = await prisma.sMSMessage.update({
    where: { id },
    data,
  });

  return NextResponse.json({ message: updated });
});

export const DELETE = withOrgAuth(async (user, request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Message ID required" }, { status: 400 });
  }

  const message = await prisma.sMSMessage.findFirst({
    where: { id },
    include: { campaign: true },
  });

  if (!message || message.campaign.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await prisma.sMSMessage.delete({ where: { id } });

  return NextResponse.json({ success: true });
});





