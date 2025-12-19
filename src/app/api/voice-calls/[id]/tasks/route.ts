import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;

    // Verify call belongs to user's organization
    const call = await prisma.voiceCall.findUnique({
      where: { id: callId },
      select: { organizationId: true }
    });

    if (!call || call.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 403 }
      );
    }

    const tasks = await prisma.callTask.findMany({
      where: { callId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const POST = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;
    const { title, description, dueDate, assignedToId } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    // Verify call belongs to user's organization
    const call = await prisma.voiceCall.findUnique({
      where: { id: callId },
      select: { organizationId: true }
    });

    if (!call || call.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Call not found or access denied" },
        { status: 403 }
      );
    }

    const task = await prisma.callTask.create({
      data: {
        callId,
        title: title.trim(),
        description: description?.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId: assignedToId || undefined
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

export const PUT = withOrgAuth(async (user, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const callId = id;
    const { taskId, completed, title, description, dueDate, assignedToId } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // Verify task belongs to a call in user's organization
    const task = await prisma.callTask.findUnique({
      where: { id: taskId },
      include: {
        call: {
          select: { organizationId: true }
        }
      }
    });

    if (!task || task.call.organizationId !== user.organizationId) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;

    const updatedTask = await prisma.callTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

