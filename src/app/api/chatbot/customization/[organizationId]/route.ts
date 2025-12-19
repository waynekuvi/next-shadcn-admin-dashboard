import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint: returns latest chatbot customization for a given organization
// This endpoint needs CORS headers since it's called from widgets embedded on external sites
export async function GET(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    if (!organizationId) {
      return NextResponse.json(
        { message: "organizationId is required" },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        chatbotGradientColor1: true,
        chatbotGradientColor2: true,
        chatbotGradientColor3: true,
        chatbotGradientColor4: true,
        chatbotAvatars: true,
        chatbotBrandLogo: true,
        chatbotWebhookUrl: true,
      },
    });

    if (!org) {
      return NextResponse.json(
        { message: "Organization not found" }, 
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    const responseData = {
      gradient: {
        color1: org.chatbotGradientColor1 ?? "#1e5eff",
        color2: org.chatbotGradientColor2 ?? "#5860f4",
        color3: org.chatbotGradientColor3 ?? "#7c3aed",
        color4: org.chatbotGradientColor4 ?? "#dcd6ff",
      },
      avatars: org.chatbotAvatars ? JSON.parse(org.chatbotAvatars) : [],
      logo: org.chatbotBrandLogo ?? null,
      webhookUrl: org.chatbotWebhookUrl ?? null,
    };

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error: any) {
    console.error("Error fetching chatbot customization:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch chatbot customization",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

