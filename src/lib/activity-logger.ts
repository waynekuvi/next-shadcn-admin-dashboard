import { prisma } from "@/lib/db";
import { ActionType } from "@prisma/client";

export async function logActivity(
  organizationId: string,
  action: ActionType,
  entityType: string,
  details: string,
  actor?: { id?: string; name?: string | null },
  entityId?: string,
  metadata?: any
) {
  try {
    await prisma.activityLog.create({
      data: {
        organizationId,
        action,
        entityType,
        details,
        actorId: actor?.id,
        actorName: actor?.name || "System",
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw to avoid interrupting the main flow
  }
}

