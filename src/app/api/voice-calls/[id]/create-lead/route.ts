import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const POST = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;
    const { name, email, phone } = await req.json();

    // Verify call belongs to user's organization
    const call = await prisma.voiceCall.findUnique({
      where: { id: callId },
      select: { organizationId: true, transcript: true, summary: true, metadata: true }
    });

    if (!call || call.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 403 }
      );
    }

    // Extract contact info if not provided
    const transcript = call.transcript || '';
    const metadata = call.metadata as any;
    
    const extractedName = name || metadata?.contactInfo?.name || '';
    const extractedPhone = phone || metadata?.contactInfo?.phone || call.fromNumber || '';
    const extractedEmail = email || metadata?.contactInfo?.email || '';

    if (!extractedName || (!extractedPhone && !extractedEmail)) {
      return NextResponse.json(
        { error: "Name and at least one contact method (phone or email) are required" },
        { status: 400 }
      );
    }

    // Create lead using existing Lead API pattern
    // Import the analyzeLead function if available, or use defaults
    let score = 75;
    let category = "SALES";

    try {
      // Try to analyze lead (if function exists)
      // const analysis = await analyzeLead({ name: extractedName, email: extractedEmail, message: transcript });
      // score = analysis.score;
      // category = analysis.category;
    } catch (e) {
      // Use defaults if analysis fails
    }

    const lead = await prisma.lead.create({
      data: {
        name: extractedName,
        email: extractedEmail || "",
        phone: extractedPhone || "",
        source: "AI Voice Call",
        status: "NEW",
        category,
        score,
        organizationId: user.organizationId,
        sourceCallId: callId,
      }
    });

    return NextResponse.json({ 
      success: true,
      lead 
    });
  } catch (error: any) {
    console.error("Error creating lead from call:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

