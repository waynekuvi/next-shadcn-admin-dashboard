import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";
import crypto from "crypto";

export const GET = withOrgAuth(async (user, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId") || user.organizationId;

    const webhooks = await prisma.callWebhook.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    // Don't return secrets in response
    const safeWebhooks = webhooks.map(wh => ({
      ...wh,
      secret: undefined
    }));

    return NextResponse.json({ webhooks: safeWebhooks });
  } catch (error: any) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const POST = withOrgAuth(async (user, req: Request) => {
  try {
    const { name, url, events, organizationId: orgId, enabled } = await req.json();
    const organizationId = orgId || user.organizationId;

    if (!name || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "name, url, and events array are required" },
        { status: 400 }
      );
    }

    // Generate a secret for webhook verification
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.callWebhook.create({
      data: {
        name,
        url,
        events,
        organizationId,
        enabled: enabled !== false,
        secret
      }
    });

    // Return webhook with secret (only on creation)
    return NextResponse.json({ webhook });
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const PUT = withOrgAuth(async (user, req: Request) => {
  try {
    const { webhookId, name, url, events, enabled } = await req.json();

    if (!webhookId) {
      return NextResponse.json(
        { error: "webhookId is required" },
        { status: 400 }
      );
    }

    // Verify webhook belongs to user's organization
    const existingWebhook = await prisma.callWebhook.findUnique({
      where: { id: webhookId },
      select: { organizationId: true }
    });

    if (!existingWebhook || existingWebhook.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Webhook not found or access denied" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = events;
    if (enabled !== undefined) updateData.enabled = enabled;

    const webhook = await prisma.callWebhook.update({
      where: { id: webhookId },
      data: updateData
    });

    // Don't return secret
    const { secret, ...safeWebhook } = webhook;
    return NextResponse.json({ webhook: safeWebhook });
  } catch (error: any) {
    console.error("Error updating webhook:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const DELETE = withOrgAuth(async (user, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get("id");

    if (!webhookId) {
      return NextResponse.json(
        { error: "webhook id is required" },
        { status: 400 }
      );
    }

    // Verify webhook belongs to user's organization
    const webhook = await prisma.callWebhook.findUnique({
      where: { id: webhookId },
      select: { organizationId: true }
    });

    if (!webhook || webhook.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Webhook not found or access denied" },
        { status: 403 }
      );
    }

    await prisma.callWebhook.delete({
      where: { id: webhookId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

