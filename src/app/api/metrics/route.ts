import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { getLeads, getReminders, getPracticeSettings } from "@/lib/sheets";
import { calculateMetrics } from "@/lib/calculations";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper function to return empty metrics
function getEmptyMetrics() {
  return {
    moneySaved: 0,
    potentialMoneySaved: 0,
    noShowRate: 0,
    baselineNoShowRate: 0,
    previousPeriodNoShowRate: 0,
    totalLeads: 0,
    totalReminders: 0,
    appointmentsBooked: 0,
    appointmentsAttended: 0,
    appointmentsNoShow: 0,
  };
}

export async function GET() {
  try {
    const session = await getServerSession();
    const organizationId = session?.user?.organizationId;

    // If user doesn't have organization, return empty metrics
    if (!organizationId) {
      return NextResponse.json(getEmptyMetrics());
    }

    let sheetId: string | undefined;

      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { googleSheetId: true },
      });
      sheetId = org?.googleSheetId;

    // If no organization, it will fall back to env var (or fail if env missing)
    // This allows dev mode / backward compat for users not in org yet

    const [leads, reminders, settings] = await Promise.all([
      getLeads(sheetId),
      getReminders(sheetId),
      getPracticeSettings(sheetId),
    ]);

    if (!settings) {
      return NextResponse.json({ error: "Practice settings not found" }, { status: 404 });
    }

    const metrics = calculateMetrics(leads, reminders, settings);
    
    // console.log("Calculated Metrics:", JSON.stringify(metrics, null, 2));

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error calculating metrics:", error);
    // If user doesn't have organization, return empty metrics instead of error
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json(getEmptyMetrics());
    }
    return NextResponse.json({ error: "Failed to calculate metrics" }, { status: 500 });
  }
}
