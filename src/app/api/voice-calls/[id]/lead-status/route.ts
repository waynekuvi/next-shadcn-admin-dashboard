import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const callId = id;

    // Check if a lead exists for this call
    const lead = await prisma.lead.findFirst({
      where: { sourceCallId: callId },
      select: { 
        id: true, 
        name: true, 
        createdAt: true,
        status: true 
      }
    });

    if (lead) {
      return NextResponse.json({ 
        exists: true, 
        lead: {
          id: lead.id,
          name: lead.name,
          status: lead.status,
          createdAt: lead.createdAt
        }
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error("Error checking lead status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

