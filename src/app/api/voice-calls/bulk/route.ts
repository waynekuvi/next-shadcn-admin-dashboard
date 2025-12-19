import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const POST = withOrgAuth(async (user, req: Request) => {
  try {
    const body = await req.json();
    const { callIds, action, tagId } = body;

    if (!Array.isArray(callIds) || callIds.length === 0) {
      return NextResponse.json(
        { error: "callIds array is required" },
        { status: 400 }
      );
    }

    if (!['archive', 'delete', 'tag'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'archive', 'delete', or 'tag'" },
        { status: 400 }
      );
    }

    // Verify all calls belong to the user's organization
    const calls = await prisma.voiceCall.findMany({
      where: {
        id: { in: callIds },
        organizationId: user.organizationId
      }
    });

    if (calls.length !== callIds.length) {
      return NextResponse.json(
        { error: "Some calls not found or don't belong to your organization" },
        { status: 403 }
      );
    }

    let result;
    switch (action) {
      case 'archive':
        result = await prisma.voiceCall.updateMany({
          where: { id: { in: callIds } },
          data: {
            archived: true,
            archivedAt: new Date()
          }
        });
        break;

      case 'delete':
        // Delete related records first
        await prisma.callNote.deleteMany({
          where: { callId: { in: callIds } }
        });
        await prisma.callTask.deleteMany({
          where: { callId: { in: callIds } }
        });
        await prisma.callAssignment.deleteMany({
          where: { callId: { in: callIds } }
        });
        await prisma.callTagAssignment.deleteMany({
          where: { callId: { in: callIds } }
        });
        
        result = await prisma.voiceCall.deleteMany({
          where: { id: { in: callIds } }
        });
        break;

      case 'tag':
        // Tag action requires tagId in body
        if (!tagId) {
          return NextResponse.json(
            { error: "tagId is required for tag action" },
            { status: 400 }
          );
        }
        
        // Create tag assignments
        await prisma.callTagAssignment.createMany({
          data: callIds.map(callId => ({
            callId,
            tagId
          })),
          skipDuplicates: true
        });
        
        result = { count: callIds.length };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      affected: result.count || callIds.length,
      action
    });
  } catch (error: any) {
    console.error("Error in bulk action:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

