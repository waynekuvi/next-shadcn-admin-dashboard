import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user) => {
  try {
    const organizationId = user.organizationId;

    // Temporarily return 0 until isRead field is added to database
    const unreadCount = 0;
    
    // TODO: Re-enable when isRead field is added
    // const unreadCount = await prisma.voiceCall.count({
    //   where: {
    //     organizationId,
    //     isRead: false,
    //   },
    // });

    return NextResponse.json({ count: unreadCount });
  } catch (error: any) {
    console.error("Error fetching unread voice calls count:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

