import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;

    // Verify call belongs to user's organization
    const call = await prisma.voiceCall.findUnique({
      where: { id: callId },
      select: { organizationId: true }
    });

    if (!call || call.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 403 }
      );
    }

    const assignment = await prisma.callAssignment.findUnique({
      where: { callId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ assignment });
  } catch (error: any) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const POST = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;
    const { assignedToId } = await req.json();

    // Verify call belongs to user's organization
    const call = await prisma.voiceCall.findUnique({
      where: { id: callId },
      select: { organizationId: true }
    });

    if (!call || call.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 403 }
      );
    }

    // If assignedToId is provided, verify user belongs to same organization
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { organizationId: true }
      });

      if (!assignedUser || assignedUser.organizationId !== user.organizationId) {
        return NextResponse.json(
          { error: "User not found or doesn't belong to your organization" },
          { status: 403 }
        );
      }
    }

    // Upsert assignment (create or update)
    const assignment = await prisma.callAssignment.upsert({
      where: { callId },
      update: {
        assignedToId: assignedToId || null,
        assignedById: user.id
      },
      create: {
        callId,
        assignedToId: assignedToId || null,
        assignedById: user.id
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ assignment });
  } catch (error: any) {
    console.error("Error assigning call:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

