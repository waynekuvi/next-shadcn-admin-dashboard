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
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID required" }, { status: 400 });
    }

    // Optional: Check if user has access to this channel (Org check or Admin check)
    // For MVP speed, relying on UI filtering mostly, but good to have security.
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        select: { organizationId: true },
      });
      if (!channel || channel.organizationId !== user.organizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const messages = await prisma.message.findMany({
      where: { channelId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    // Mark messages as read if they're not sent by the current user
    const unreadMessageIds = messages
      .filter((m) => m.senderId !== user.id && !m.read)
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessageIds },
        },
        data: {
          read: true,
        },
      });
    }

    const formattedMessages = messages.map((m) => {
      // Parse content - could be JSON with attachments or plain text
      let content = m.content;
      let attachments: any[] | undefined;

      try {
        const parsed = JSON.parse(m.content);
        if (parsed.attachments && Array.isArray(parsed.attachments)) {
          content = parsed.content || "";
          attachments = parsed.attachments;
        }
      } catch {
        // Not JSON, use as-is
      }

      return {
        id: m.id,
        sender: m.senderId === user.id ? "me" : "them",
        senderName: m.sender.name || "Unknown",
        senderImage: m.sender.image || null,
        senderRole: m.sender.role,
        content,
        attachments,
        timestamp: m.createdAt.toISOString(),
      };
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { channelId, content } = await req.json();

    if (!channelId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { organizationId: true },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && channel.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        senderId: user.id,
      },
    });

    // Extract text content for lastMessage preview (handle JSON with attachments)
    let lastMessageText = content;
    try {
      const parsed = JSON.parse(content);
      if (parsed.content && typeof parsed.content === "string") {
        lastMessageText = parsed.content;
      } else if (parsed.attachments && Array.isArray(parsed.attachments)) {
        lastMessageText = "📎 Attachment";
      }
    } catch {
      // Not JSON, use as-is
    }

    // Update channel last message
    await prisma.channel.update({
      where: { id: channelId },
      data: {
        lastMessage: lastMessageText,
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

