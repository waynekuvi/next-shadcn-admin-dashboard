import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Webhook endpoint to receive chatbot conversations
// This endpoint is called by n8n or the chatbot widget
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    const {
      organizationId,
      customerName,
      customerEmail,
      sessionId,
      channelId, // If provided, use existing channel; otherwise create new
      message,
      metadata,
      role = "user",
    } = body;

    if (!organizationId || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields: organizationId, customerName" },
        { status: 400 }
      );
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // 1. Identify or Create the Sender (User)
    let senderId: string;

    if (role === "assistant") {
      const botEmail = `bot-${organizationId}@uplinq.ai`;
      
      const botUser = await prisma.user.upsert({
        where: { email: botEmail },
        update: {},
        create: {
          email: botEmail,
          name: "AI Assistant",
          organizationId: organization.id,
          role: "CLIENT",
          image: "https://ui-avatars.com/api/?name=AI&background=random", 
        },
      });
      senderId = botUser.id;

    } else {
      // Use sessionId or timestamp to create unique guest users
      const uniqueId = sessionId || `${Date.now()}`;
      const emailToUse = customerEmail || `guest-${uniqueId}@uplinq.local`;
      
      let customerUser = await prisma.user.findUnique({
        where: { email: emailToUse },
      });

      if (!customerUser) {
        customerUser = await prisma.user.create({
          data: {
            email: emailToUse,
            name: customerName,
            organizationId: organization.id,
            role: "CLIENT",
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random`,
          },
        });
      }
      senderId = customerUser.id;
    }

    // 2. Find or Create Channel
    let channel = null;

    // If channelId is provided, try to use existing channel
    if (channelId) {
      channel = await prisma.channel.findFirst({
        where: {
          id: channelId,
          organizationId,
          type: "CHATBOT",
        },
      });
    }

    // If no channel found (or no channelId provided), create a new one
    if (!channel) {
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const channelDisplayName = metadata
        ? `${customerName} - ${metadata}`
        : `${customerName} - ${timestamp}`;

      channel = await prisma.channel.create({
        data: {
          name: channelDisplayName,
          type: "CHATBOT",
          organizationId,
          lastMessage: message || "Conversation started",
          lastMessageAt: new Date(),
        },
      });
    }

    // 3. Create Message Record (if content exists)
    if (message) {
      await prisma.message.create({
        data: {
          content: message,
          channelId: channel.id,
          senderId: senderId,
          read: role === "assistant",
        },
      });

      // Update channel last message
      await prisma.channel.update({
        where: { id: channel.id },
        data: {
          lastMessage: message.length > 100 ? message.substring(0, 100) + "..." : message,
          lastMessageAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      channelId: channel.id, // Return channelId for subsequent messages
      sessionId: sessionId || `session-${Date.now()}`,
      message: "Message processed successfully",
    });

  } catch (error: any) {
    console.error("Error processing chatbot webhook:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ status: "ok", message: "Chatbot webhook active" });
}
