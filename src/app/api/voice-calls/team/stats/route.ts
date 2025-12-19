import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId") || user.organizationId;

    // Get all users in the organization
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Get assignments for this organization
    const assignments = await prisma.callAssignment.findMany({
      where: {
        call: {
          organizationId
        }
      },
      include: {
        call: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            endedAt: true,
            createdAt: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate stats per user
    const stats = users.map(user => {
      const userAssignments = assignments.filter(a => a.assignedToId === user.id);
      const completedCalls = userAssignments.filter(a => a.call.status === 'ended').length;
      
      // Calculate average response time (time from call creation to assignment)
      const responseTimes = userAssignments
        .filter(a => a.call.createdAt && a.createdAt)
        .map(a => {
          const callCreated = new Date(a.call.createdAt).getTime();
          const assignedAt = new Date(a.createdAt).getTime();
          return (assignedAt - callCreated) / 1000 / 60; // minutes
        });

      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null;

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        totalCalls: userAssignments.length,
        assignedCalls: userAssignments.length,
        completedCalls,
        avgResponseTime
      };
    });

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error("Error fetching team stats:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

