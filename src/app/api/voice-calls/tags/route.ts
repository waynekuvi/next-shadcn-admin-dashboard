import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId") || user.organizationId;

    const tags = await prisma.callTag.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error("Error fetching tags:", error);
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
    const { name, color, organizationId: orgId } = await req.json();
    const organizationId = orgId || user.organizationId;

    if (!name || !color) {
      return NextResponse.json(
        { error: "name and color are required" },
        { status: 400 }
      );
    }

    const tag = await prisma.callTag.create({
      data: {
        name,
        color,
        organizationId
      }
    });

    return NextResponse.json({ tag });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating tag:", error);
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
    const tagId = searchParams.get("id");

    if (!tagId) {
      return NextResponse.json(
        { error: "tag id is required" },
        { status: 400 }
      );
    }

    // Verify tag belongs to user's organization
    const tag = await prisma.callTag.findUnique({
      where: { id: tagId }
    });

    if (!tag || tag.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Tag not found or access denied" },
        { status: 403 }
      );
    }

    // Delete tag assignments first
    await prisma.callTagAssignment.deleteMany({
      where: { tagId }
    });

    // Delete tag
    await prisma.callTag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

