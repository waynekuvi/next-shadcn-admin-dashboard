import { NextRequest, NextResponse } from "next/server";
import { getReminders, addReminder, updateReminder, deleteReminder } from "@/lib/sheets";
import { prisma } from "@/lib/db";
import { createReminderSchema, updateReminderSchema, deleteReminderSchema } from "@/lib/validations/reminder";
import { logActivity } from "@/lib/activity-logger";
import { ActionType } from "@prisma/client";
import { withOrgAuth } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

// Helper to get Google Sheet ID
async function getSheetId(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { googleSheetId: true },
  });
  return org?.googleSheetId;
}

export const GET = withOrgAuth(async (user, request: Request) => {
    const sheetId = await getSheetId(user.organizationId);
    const reminders = await getReminders(sheetId);

    // Sort by timestamp descending
    reminders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ reminders });
});

export const POST = withOrgAuth(async (user, request: Request) => {
    const json = await request.json();
    const validation = createReminderSchema.safeParse(json);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.flatten() }, { status: 400 });
    }

    const body = validation.data;
    const sheetId = await getSheetId(user.organizationId);

    // Save to Google Sheets
    const success = await addReminder({
        patient_name: body.patient_name,
        appointment_date: body.appointment_date,
        reminder_type: body.reminder_type,
        confirmed: body.confirmed,
        showed_up: body.showed_up
    }, sheetId);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to add reminder to Google Sheets" }, { status: 500 });
    }

    // Sync to DB (Robustness)
    try {
        await prisma.reminder.create({
            data: {
                patientName: body.patient_name,
                appointmentDate: new Date(body.appointment_date), // Assuming format is parsable
                reminderType: body.reminder_type,
                confirmed: body.confirmed === "Yes",
                showedUp: body.showed_up === "Yes",
                organizationId: user.organizationId
            }
        });
    } catch (dbError) {
        console.error("Failed to sync reminder to DB:", dbError);
    }

    // Log Activity
    await logActivity(
        user.organizationId,
        ActionType.CREATE,
        "REMINDER",
        `Reminder scheduled for ${body.patient_name}`,
        { id: user.id, name: user.name },
        body.patient_name,
        { type: body.reminder_type, date: body.appointment_date }
    );

    return NextResponse.json({ success: true });
});

export const PUT = withOrgAuth(async (user, request: Request) => {
    const json = await request.json();
    const validation = updateReminderSchema.safeParse(json);
    
    if (!validation.success) {
       return NextResponse.json({ error: "Invalid request data", details: validation.error.flatten() }, { status: 400 });
    }

    const { originalReminder, newReminder } = validation.data;
    const sheetId = await getSheetId(user.organizationId);
    
    const success = await updateReminder(originalReminder, newReminder, sheetId);

    if (!success) {
      return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
    }

    // Log Activity
    await logActivity(
        user.organizationId,
        ActionType.UPDATE,
        "REMINDER",
        `Reminder updated for ${newReminder.patient_name}`,
        { id: user.id, name: user.name },
        newReminder.patient_name,
        { date: newReminder.appointment_date, confirmed: newReminder.confirmed }
    );
    
    return NextResponse.json({ success: true });
});

export const DELETE = withOrgAuth(async (user, request: Request) => {
    const json = await request.json();
    const validation = deleteReminderSchema.safeParse(json);

    if (!validation.success) {
        return NextResponse.json({ error: "Invalid request data", details: validation.error.flatten() }, { status: 400 });
    }

    const body = validation.data;
    const sheetId = await getSheetId(user.organizationId);

    const success = await deleteReminder(body, sheetId);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
    }

    await logActivity(
        user.organizationId,
        ActionType.DELETE,
        "REMINDER",
        `Reminder deleted for ${body.patient_name}`,
        { id: user.id, name: user.name },
        body.patient_name
    );
    
    // Also delete from DB if possible (complex without ID, skip for MVP or use best-effort matching)
    
    return NextResponse.json({ success: true });
});
