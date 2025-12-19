import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const user = session.user as any;
    const userRole = user.role; // ADMIN or CLIENT
    const orgId = user.organizationId;

    let channels;

    if (userRole === "ADMIN") {
      // Super Admin sees all channels or filtered by organizationId if provided
      const targetOrgId = searchParams.get("organizationId");
      
      channels = await prisma.channel.findMany({
        where: targetOrgId ? { organizationId: targetOrgId } : {},
        orderBy: { lastMessageAt: "desc" },
        include: {
          organization: {
            select: { name: true, logo: true },
          },
        },
      });
    } else {
      // Normal user sees channels for their organization
      if (!orgId) {
        return NextResponse.json({ error: "No organization found" }, { status: 400 });
      }

      channels = await prisma.channel.findMany({
        where: { organizationId: orgId },
        orderBy: { lastMessageAt: "desc" },
        include: {
          organization: {
            select: { name: true, logo: true },
          },
        },
      });
    }

    // Get unread counts for each channel
    const channelIds = channels.map((c) => c.id);
    const unreadCounts = await prisma.message.groupBy({
      by: ["channelId"],
      where: {
        channelId: { in: channelIds },
        senderId: { not: user.id },
        read: false,
      },
      _count: {
        id: true,
      },
    });

    const unreadCountMap = new Map(
      unreadCounts.map((uc) => [uc.channelId, uc._count.id])
    );

    // Format for frontend
    const formattedChannels = channels.map((c) => {
      // Normalize support channel names - check type case-insensitively
      const channelType = (c.type || "").toUpperCase();
      const isSupportChannel = channelType === "SUPPORT";
      
      let displayName = c.name || c.organization.name;
      
      if (isSupportChannel) {
        if (userRole !== "ADMIN") {
          // For clients, always show "Atliso Support Team" for support channels
          displayName = "Atliso Support Team";
        } else {
          // For admins, show org name + Support for better context
          if (c.name === "Support" || c.name === "Atliso Support Team" || !c.name) {
            displayName = `${c.organization.name} Support`;
          }
        }
      }
      
      // Use Atliso logo for support channels when viewed by clients
      let avatarUrl = c.organization.logo;
      if (isSupportChannel && userRole !== "ADMIN") {
        avatarUrl = "https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg";
      }
      
      const unreadCount = unreadCountMap.get(c.id) || 0;
      
      return {
        id: c.id,
        name: displayName,
        avatar: avatarUrl,
        lastMessage: c.lastMessage || "No messages yet",
        lastMessageTime: c.lastMessageAt.toISOString(),
        type: channelType.toLowerCase(), // group or support
        organizationName: c.organization.name,
        unreadCount,
      };
    });

    return NextResponse.json(formattedChannels);
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json().catch(() => ({}));
    const { name, organizationId } = body;

    let targetOrgId = user.organizationId;

    if (user.role === "ADMIN") {
      if (!organizationId) {
        return NextResponse.json({ error: "organizationId required for admins" }, { status: 400 });
      }
      targetOrgId = organizationId;
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    if (user.role !== "ADMIN" && organizationId && organizationId !== targetOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: targetOrgId },
      select: { id: true, name: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Default channel name: "Atliso Support Team" for clients, or custom name for admins
    const channelName = name || (user.role === "ADMIN" ? `${organization.name} Support` : "Atliso Support Team");

    const channel = await prisma.channel.create({
      data: {
        name: channelName,
        type: "SUPPORT",
        organizationId: targetOrgId,
        lastMessage: "Channel created",
      },
    });

    return NextResponse.json(channel);
  } catch (error: any) {
    console.error("Error creating channel:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 });
  }
}

