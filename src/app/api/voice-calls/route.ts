import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_API_URL = "https://api.vapi.ai";

// Fetch calls from Vapi API
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // If organizationId is provided, fetch from our database
    if (organizationId) {
      const dbCalls = await prisma.voiceCall.findMany({
        where: { 
          organizationId
        },
        orderBy: { createdAt: "desc" }, // Most recent first
        take: limit,
        skip: offset,
      });

      // Get total count for pagination
      const totalCount = await prisma.voiceCall.count({
        where: { 
          organizationId
        }
      });

      return NextResponse.json({
        calls: dbCalls,
        total: totalCount,
        limit,
        offset,
      });
    }

    // If no organizationId and VAPI_API_KEY is configured, try Vapi API
    if (VAPI_API_KEY) {
      try {
        const vapiResponse = await fetch(`${VAPI_API_URL}/call?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (vapiResponse.ok) {
          const vapiCalls = await vapiResponse.json();
    return NextResponse.json({
      calls: vapiCalls,
      total: vapiCalls.length,
            limit,
            offset,
          });
        }
      } catch (vapiError) {
        console.error("Vapi API error:", vapiError);
        // Fall through to return empty array
      }
    }

    // Return empty array if no data source available
    return NextResponse.json({
      calls: [],
      total: 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching voice calls:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Get call statistics
export async function POST(req: Request) {
  try {
    const { organizationId, startDate, endDate } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId required" }, { status: 400 });
    }

    // Fetch from our database (has more detailed data)
    const where: any = { organizationId };
    
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(startDate);
      if (endDate) where.startedAt.lte = new Date(endDate);
    }

    const calls = await prisma.voiceCall.findMany({
      where,
      orderBy: { startedAt: "desc" },
    });

    // Calculate statistics
    const totalCalls = calls.length;
    const endedCalls = calls.filter((c) => c.status === "ended");
    const totalDuration = endedCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const avgDuration = endedCalls.length > 0 ? totalDuration / endedCalls.length : 0;
    const totalCost = calls.reduce((sum, c) => sum + (c.cost || 0), 0);
    const avgCost = calls.length > 0 ? totalCost / calls.length : 0;
    
    // Count outcomes - check multiple signals for booked appointments
    const appointmentsBooked = calls.filter((c) => {
      // Check explicit outcome
      if (c.outcome === "appointment_booked" || c.outcome === "success") return true;
      
      // Check metadata for function calls
      if ((c.metadata as any)?.functionCalls?.some((fc: any) => fc.name?.includes("book"))) return true;
      
      // Check summary for booking-related keywords
      const summary = (c.summary || '').toLowerCase();
      if (summary.includes('booked') || 
          summary.includes('appointment') || 
          summary.includes('scheduled') ||
          summary.includes('confirmed')) return true;
      
      // Check transcript for booking confirmation
      const transcript = (c.transcript || '').toLowerCase();
      if (transcript.includes('booked') && (transcript.includes('appointment') || transcript.includes('time'))) return true;
      
      return false;
    }).length;
    
    const helpdeskResolved = calls.filter((c) => 
      c.outcome === "helpdesk_resolved"
    ).length;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCalls = calls.filter((c) => 
      c.startedAt && c.startedAt >= today
    ).length;

    // This week's stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCalls = calls.filter((c) => 
      c.startedAt && c.startedAt >= weekAgo
    ).length;

    // This month's stats
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthCalls = calls.filter((c) => 
      c.startedAt && c.startedAt >= monthAgo
    ).length;

    return NextResponse.json({
      total: totalCalls,
      today: todayCalls,
      thisWeek: weekCalls,
      thisMonth: monthCalls,
      appointmentsBooked,
      helpdeskResolved,
      avgDuration: Math.round(avgDuration),
      totalDuration,
      avgCost: Math.round(avgCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      calls: calls.slice(0, 20), // Return recent calls
    });
  } catch (error: any) {
    console.error("Error fetching call statistics:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

