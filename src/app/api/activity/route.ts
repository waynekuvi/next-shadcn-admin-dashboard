import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { withAuth } from "@/lib/api-middleware";
import { getLeads, getReminders } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (user) => {
    // 1. If user belongs to an organization, fetch robust logs from DB
    if (user.organizationId) {
        const logs = await prisma.activityLog.findMany({
            where: { organizationId: user.organizationId },
            orderBy: { createdAt: 'desc' },
            take: 50, 
            include: {
               organization: { select: { name: true } }
            }
        });

        const activity = logs.map(log => ({
            id: log.id,
            type: log.entityType,
            timestamp: log.createdAt.toISOString(),
            description: log.details,
            details: log.metadata,
            actor: log.actorName,
            action: log.action,
            timeAgo: formatDistanceToNow(log.createdAt, { addSuffix: true })
        }));
        
        return NextResponse.json({ activity });
    }

    // 2. Fallback for Demo/No-Org Users: Synthesize from Sheets (Legacy Mode)
    // This ensures the dashboard doesn't break for users relying on env vars
    try {
        // We pass undefined to use the env var fallback in getLeads/getReminders
        const [leads, reminders] = await Promise.all([getLeads(undefined), getReminders(undefined)]);

        const activity = [
            ...leads.map((l) => ({
                id: `lead-${l.timestamp}-${l.email}`,
                type: "LEAD",
                timestamp: l.timestamp,
                description: `New lead: ${l.name}`,
                details: l,
                action: "CREATE",
                actor: "System",
                timeAgo: formatDistanceToNow(new Date(l.timestamp), { addSuffix: true })
            })),
            ...reminders.map((r) => ({
                id: `reminder-${r.timestamp}-${r.patient_name}`,
                type: "REMINDER",
                timestamp: r.timestamp,
                description: `Reminder sent to ${r.patient_name}`,
                details: r,
                action: "CREATE",
                actor: "System",
                timeAgo: formatDistanceToNow(new Date(r.timestamp), { addSuffix: true })
            })),
        ];

        // Sort by timestamp descending
        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Limit to 50
        return NextResponse.json({ activity: activity.slice(0, 50) });
    } catch (error) {
        console.error("Error synthesizing activity:", error);
        return NextResponse.json({ activity: [] }); // Return empty instead of crash
    }
});
