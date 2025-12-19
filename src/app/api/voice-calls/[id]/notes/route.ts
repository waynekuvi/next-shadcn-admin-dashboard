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

    const notes = await prisma.callNote.findMany({
      where: { callId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("Error fetching notes:", error);
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
    const { content, isInternal } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
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

    const note = await prisma.callNote.create({
      data: {
        callId,
        userId: user.id,
        content: content.trim(),
        isInternal: isInternal !== false // Default to true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

