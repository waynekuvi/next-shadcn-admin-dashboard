import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    // Only ADMIN can create organizations
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { 
      name, 
      googleSheetId, 
      logo, 
      contactEmail, 
      timezone,
      // Vapi Integration
      vapiApiKey,
      vapiAssistantId,
      voiceAiEnabled,
      // Google Calendar
      googleCalendarId,
      googleCalendarEnabled,
      // Chatbot
      chatbotWebhookUrl,
      chatbotEmbedCode,
      // SMS
      smsEnabled,
      smsReminderWebhookUrl,
      smsFollowUpWebhookUrl,
    } = await req.json();

    // Generate a simple random join code
    const joinCode = `${name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const org = await prisma.organization.create({
      data: {
        name,
        googleSheetId: googleSheetId || null,
        joinCode,
        logo: logo || null,
        contactEmail: contactEmail || null,
        timezone: timezone || "UTC",
        // Vapi Integration
        vapiApiKey: vapiApiKey || null,
        vapiAssistantId: vapiAssistantId || null,
        voiceAiEnabled: voiceAiEnabled || false,
        // Google Calendar
        googleCalendarId: googleCalendarId || null,
        googleCalendarEnabled: googleCalendarEnabled || false,
        // Chatbot
        chatbotWebhookUrl: chatbotWebhookUrl || null,
        chatbotEmbedCode: chatbotEmbedCode || null,
        // SMS
        smsEnabled: smsEnabled || false,
        smsReminderWebhookUrl: smsReminderWebhookUrl || null,
        smsFollowUpWebhookUrl: smsFollowUpWebhookUrl || null,
      },
    });

    return NextResponse.json({ organization: org });
  } catch (error: any) {
    console.error("Error creating organization:", error);
    // Return more specific error message if possible
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
