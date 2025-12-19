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
    const userRole = user.role;
    const orgId = user.organizationId;
    const filter = searchParams.get("filter") || "all"; // all, open, assigned, unassigned

    if (!orgId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // Fetch chatbot conversations (channels with type CHATBOT)
    let channels;
    const where: any = {
      type: "CHATBOT",
    };

    if (userRole === "ADMIN") {
      const targetOrgId = searchParams.get("organizationId");
      if (targetOrgId) {
        where.organizationId = targetOrgId;
      }
    } else {
      where.organizationId = orgId;
    }

    channels = await prisma.channel.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      include: {
        organization: {
          select: { name: true, logo: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

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

    // Format conversations for frontend
    const conversations = channels.map((c) => {
      const lastMessage = c.messages[0];
      const unreadCount = unreadCountMap.get(c.id) || 0;
      
      // Extract metadata from channel name or messages
      // Channel name format could be like "John Doe - Chatbot Conversation"
      const nameParts = c.name.split(" - ");
      const customerName = nameParts[0] || c.name;
      const metadata = nameParts.length > 1 ? nameParts.slice(1).join(" - ") : null;

      return {
        id: c.id,
        customerName,
        avatar: lastMessage?.sender?.image || null,
        lastMessage: c.lastMessage || lastMessage?.content || "No messages yet",
        lastMessageTime: c.lastMessageAt.toISOString(),
        unreadCount,
        metadata,
        messageCount: c._count.messages,
        organizationId: c.organizationId,
        organizationName: c.organization.name,
      };
    });

    // Apply filters
    let filteredConversations = conversations;
    
    if (filter === "open") {
      // Open = has unread messages or recent activity (within 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      filteredConversations = conversations.filter(
        (c) => c.unreadCount > 0 || new Date(c.lastMessageTime) > oneDayAgo
      );
    } else if (filter === "unassigned") {
      // For now, all chatbot conversations are considered unassigned
      // You can extend this later with assignment logic
      filteredConversations = conversations;
    }

    // Calculate counts for sidebar
    const counts = {
      inbox: conversations.filter((c) => c.unreadCount > 0).length, // Unread conversations
      all: conversations.length, // Total conversations
    };

    return NextResponse.json({
      conversations: filteredConversations,
      counts,
    });
  } catch (error: any) {
    console.error("Error fetching chatbot conversations:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Create a new chatbot conversation
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json().catch(() => ({}));
    const { customerName, organizationId, metadata } = body;

    let targetOrgId = user.organizationId;

    if (user.role === "ADMIN") {
      if (!organizationId) {
        return NextResponse.json(
          { error: "organizationId required for admins" },
          { status: 400 }
        );
      }
      targetOrgId = organizationId;
    }

    if (!targetOrgId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    if (user.role !== "ADMIN" && organizationId && organizationId !== targetOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: targetOrgId },
      select: { id: true, name: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const channelName = metadata
      ? `${customerName} - ${metadata}`
      : `${customerName} - Chatbot Conversation`;

    const channel = await prisma.channel.create({
      data: {
        name: channelName,
        type: "CHATBOT",
        organizationId: targetOrgId,
        lastMessage: "Conversation started",
      },
    });

    return NextResponse.json(channel);
  } catch (error: any) {
    console.error("Error creating chatbot conversation:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
