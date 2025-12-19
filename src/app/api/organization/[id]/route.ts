import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { id } = await params;

    // Check if user is ADMIN or belongs to this organization
    const isAdmin = user.role === "ADMIN";
    const isMember = user.organizationId === id;

    if (!isAdmin && !isMember) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const org = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logo: true,
        contactEmail: true,
        timezone: true,
        isActive: true,
        voiceAiEnabled: true,
        googleCalendarEnabled: true,
        smsEnabled: true,
        smsReminderWebhookUrl: true,
        smsFollowUpWebhookUrl: true,
        // Don't expose sensitive keys to clients
        vapiApiKey: isAdmin,
        vapiAssistantId: true,
        googleCalendarId: isAdmin,
        googleSheetId: isAdmin,
      },
    });

    if (!org) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      googleSheetId,
      logo,
      contactEmail,
      timezone,
      isActive,
      chatbotEmbedCode,
      chatbotGradientColor1,
      chatbotGradientColor2,
      chatbotGradientColor3,
      chatbotGradientColor4,
      chatbotAvatars,
      chatbotBrandLogo,
      // Vapi Integration
      vapiApiKey,
      vapiAssistantId,
      voiceAiEnabled,
      // Google Calendar
      googleCalendarId,
      googleCalendarEnabled,
      // SMS
      smsEnabled,
      smsReminderWebhookUrl,
      smsFollowUpWebhookUrl,
      // Chatbot Webhook
      chatbotWebhookUrl,
    } = body;

    // Check if user is ADMIN or organization owner
    const isAdmin = user.role === "ADMIN";
    let isOwner = false;

    if (!isAdmin) {
      // Check if user is owner of this organization
      const org = await prisma.organization.findUnique({
        where: { id },
        include: {
          users: {
            where: { id: user.id },
            select: { orgRole: true },
          },
        },
      });

      isOwner = org?.users[0]?.orgRole === "OWNER";
    }

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (googleSheetId !== undefined) updateData.googleSheetId = googleSheetId;
    if (logo !== undefined) updateData.logo = logo || null;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (chatbotEmbedCode !== undefined) {
      // Handle empty string as null for optional field
      updateData.chatbotEmbedCode = chatbotEmbedCode && chatbotEmbedCode.trim() !== "" ? chatbotEmbedCode : null;
    }
    if (chatbotGradientColor1 !== undefined) updateData.chatbotGradientColor1 = chatbotGradientColor1;
    if (chatbotGradientColor2 !== undefined) updateData.chatbotGradientColor2 = chatbotGradientColor2;
    if (chatbotGradientColor3 !== undefined) updateData.chatbotGradientColor3 = chatbotGradientColor3;
    if (chatbotGradientColor4 !== undefined) updateData.chatbotGradientColor4 = chatbotGradientColor4;
    if (chatbotAvatars !== undefined) {
      updateData.chatbotAvatars = Array.isArray(chatbotAvatars) ? JSON.stringify(chatbotAvatars) : chatbotAvatars;
    }
    if (chatbotBrandLogo !== undefined) {
      updateData.chatbotBrandLogo = chatbotBrandLogo && chatbotBrandLogo.trim() !== "" ? chatbotBrandLogo : null;
    }
    // Vapi Integration
    if (vapiApiKey !== undefined) {
      updateData.vapiApiKey = vapiApiKey && vapiApiKey.trim() !== "" ? vapiApiKey : null;
    }
    if (vapiAssistantId !== undefined) {
      updateData.vapiAssistantId = vapiAssistantId && vapiAssistantId.trim() !== "" ? vapiAssistantId : null;
    }
    if (voiceAiEnabled !== undefined) {
      updateData.voiceAiEnabled = voiceAiEnabled;
    }
    // Google Calendar
    if (googleCalendarId !== undefined) {
      updateData.googleCalendarId = googleCalendarId && googleCalendarId.trim() !== "" ? googleCalendarId : null;
    }
    if (googleCalendarEnabled !== undefined) {
      updateData.googleCalendarEnabled = googleCalendarEnabled;
    }
    // SMS
    if (smsEnabled !== undefined) {
      updateData.smsEnabled = smsEnabled;
    }
    if (smsReminderWebhookUrl !== undefined) {
      updateData.smsReminderWebhookUrl =
        smsReminderWebhookUrl && smsReminderWebhookUrl.trim() !== "" ? smsReminderWebhookUrl : null;
    }
    if (smsFollowUpWebhookUrl !== undefined) {
      updateData.smsFollowUpWebhookUrl =
        smsFollowUpWebhookUrl && smsFollowUpWebhookUrl.trim() !== "" ? smsFollowUpWebhookUrl : null;
    }
    // Chatbot Webhook
    if (chatbotWebhookUrl !== undefined) {
      updateData.chatbotWebhookUrl = chatbotWebhookUrl && chatbotWebhookUrl.trim() !== "" ? chatbotWebhookUrl : null;
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedOrg);
  } catch (error: any) {
    console.error("Error updating organization:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error?.message || "Unknown error",
        ...(process.env.NODE_ENV === "development" && { details: error?.stack })
      },
      { status: 500 }
    );
  }
}
