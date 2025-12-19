import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const POST = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;
    const { tagId } = await req.json();

    if (!tagId) {
      return NextResponse.json(
        { error: "tagId is required" },
        { status: 400 }
      );
    }

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

    // Verify tag belongs to user's organization
    const tag = await prisma.callTag.findUnique({
      where: { id: tagId },
      select: { organizationId: true }
    });

    if (!tag || tag.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Tag not found or access denied" },
        { status: 403 }
      );
    }

    // Create tag assignment (skip if already exists)
    const assignment = await prisma.callTagAssignment.create({
      data: {
        callId,
        tagId
      }
    }).catch((error: any) => {
      if (error.code === 'P2002') {
        // Already exists, return success
        return { id: 'exists' };
      }
      throw error;
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error("Error applying tag:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const DELETE = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;
    const { searchParams } = new URL(req.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        { error: "tagId is required" },
        { status: 400 }
      );
    }

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

    await prisma.callTagAssignment.delete({
      where: {
        callId_tagId: {
          callId,
          tagId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing tag:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

