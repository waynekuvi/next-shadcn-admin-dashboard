import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Debug logging
    console.log("Channel PATCH - User role check:", {
      userId: user.id,
      userRole: user.role,
      isAdmin: user.role === "ADMIN",
    });
    
    // Check if user is admin - verify from database if session role doesn't match
    let isAdmin = user.role?.toUpperCase() === "ADMIN";
    if (!isAdmin) {
      // Double-check from database in case session is stale
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      isAdmin = dbUser?.role?.toUpperCase() === "ADMIN";
      console.log("Channel PATCH - Database role check:", {
        dbRole: dbUser?.role,
        isAdmin,
      });
    }
    
    if (!isAdmin) {
      console.error("Channel PATCH - Forbidden: User role is", user.role, "expected ADMIN");
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { name, type } = body;

    // Check if channel exists
    const existingChannel = await prisma.channel.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!existingChannel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Update channel
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;

    const updatedChannel = await prisma.channel.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: { name: true, logo: true },
        },
      },
    });

    // Format response similar to GET endpoint
    let displayName = updatedChannel.name || updatedChannel.organization.name;
    if (updatedChannel.type === "SUPPORT") {
      if (updatedChannel.name === "Support" || updatedChannel.name === "Atliso Support Team" || !updatedChannel.name) {
        displayName = `${updatedChannel.organization.name} Support`;
      }
    }

    return NextResponse.json({
      id: updatedChannel.id,
      name: displayName,
      avatar: updatedChannel.organization.logo,
      lastMessage: updatedChannel.lastMessage || "No messages yet",
      lastMessageTime: updatedChannel.lastMessageAt.toISOString(),
      type: updatedChannel.type.toLowerCase(),
      organizationName: updatedChannel.organization.name,
    });
  } catch (error: any) {
    console.error("Error updating channel:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Debug logging
    console.log("Channel DELETE - User role check:", {
      userId: user.id,
      userRole: user.role,
      isAdmin: user.role === "ADMIN",
    });
    
    // Check if user is admin - verify from database if session role doesn't match
    let isAdmin = user.role?.toUpperCase() === "ADMIN";
    if (!isAdmin) {
      // Double-check from database in case session is stale
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      isAdmin = dbUser?.role?.toUpperCase() === "ADMIN";
      console.log("Channel DELETE - Database role check:", {
        dbRole: dbUser?.role,
        isAdmin,
      });
    }
    
    if (!isAdmin) {
      console.error("Channel DELETE - Forbidden: User role is", user.role, "expected ADMIN");
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { id } = await params;

    // Check if channel exists
    const existingChannel = await prisma.channel.findUnique({
      where: { id },
    });

    if (!existingChannel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Delete channel (messages will be cascade deleted due to onDelete: Cascade)
    await prisma.channel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Channel deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting channel:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 });
  }
}

