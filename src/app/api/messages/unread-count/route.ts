import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const user = session.user as any;
    const userRole = user.role; // ADMIN or CLIENT
    const orgId = user.organizationId;

    let channels;

    if (userRole === "ADMIN") {
      // Super Admin sees all channels
      channels = await prisma.channel.findMany({
        select: { id: true },
      });
    } else {
      // Normal user sees channels for their organization
      if (!orgId) {
        return NextResponse.json({ count: 0 });
      }

      channels = await prisma.channel.findMany({
        where: { organizationId: orgId },
        select: { id: true },
      });
    }

    const channelIds = channels.map((c) => c.id);

    if (channelIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    // Count unread messages (messages not sent by the current user and not read)
    const unreadCount = await prisma.message.count({
      where: {
        channelId: { in: channelIds },
        senderId: { not: user.id },
        read: false,
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ count: 0 });
  }
}

