import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId") || user.organizationId;

    const rules = await prisma.callAutomationRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ rules });
  } catch (error: any) {
    console.error("Error fetching automation rules:", error);
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
    const { name, triggerType, conditions, actions, organizationId: orgId, enabled } = await req.json();
    const organizationId = orgId || user.organizationId;

    if (!name || !triggerType || !conditions || !actions) {
      return NextResponse.json(
        { error: "name, triggerType, conditions, and actions are required" },
        { status: 400 }
      );
    }

    const rule = await prisma.callAutomationRule.create({
      data: {
        name,
        triggerType,
        conditions,
        actions,
        organizationId,
        enabled: enabled !== false
      }
    });

    return NextResponse.json({ rule });
  } catch (error: any) {
    console.error("Error creating automation rule:", error);
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
    const { ruleId, name, triggerType, conditions, actions, enabled } = await req.json();

    if (!ruleId) {
      return NextResponse.json(
        { error: "ruleId is required" },
        { status: 400 }
      );
    }

    // Verify rule belongs to user's organization
    const existingRule = await prisma.callAutomationRule.findUnique({
      where: { id: ruleId },
      select: { organizationId: true }
    });

    if (!existingRule || existingRule.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Rule not found or access denied" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (triggerType !== undefined) updateData.triggerType = triggerType;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (actions !== undefined) updateData.actions = actions;
    if (enabled !== undefined) updateData.enabled = enabled;

    const rule = await prisma.callAutomationRule.update({
      where: { id: ruleId },
      data: updateData
    });

    return NextResponse.json({ rule });
  } catch (error: any) {
    console.error("Error updating automation rule:", error);
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
    const ruleId = searchParams.get("id");

    if (!ruleId) {
      return NextResponse.json(
        { error: "rule id is required" },
        { status: 400 }
      );
    }

    // Verify rule belongs to user's organization
    const rule = await prisma.callAutomationRule.findUnique({
      where: { id: ruleId },
      select: { organizationId: true }
    });

    if (!rule || rule.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Rule not found or access denied" },
        { status: 403 }
      );
    }

    await prisma.callAutomationRule.delete({
      where: { id: ruleId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting automation rule:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

