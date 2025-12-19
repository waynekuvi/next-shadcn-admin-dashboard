import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { executionId, messageId, status, timestamp } = await req.json();

    if (!executionId || !status) {
      return NextResponse.json({ error: "executionId and status are required" }, { status: 400 });
    }

    await prisma.sMSExecution.update({
      where: { id: executionId },
      data: {
        deliveryStatus: {
          messageId,
          status,
          timestamp: timestamp || new Date().toISOString(),
        },
        status:
          status === "delivered"
            ? "DELIVERED"
            : status === "failed"
            ? "FAILED"
            : status === "cancelled"
            ? "CANCELLED"
            : status === "sent"
            ? "SENT"
            : "SENT",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("sms-status webhook error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}





