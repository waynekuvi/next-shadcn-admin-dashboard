import { NextRequest, NextResponse } from "next/server";
import { getLeads, addLead, updateLead, deleteLead } from "@/lib/sheets";
import { prisma } from "@/lib/db";
import { analyzeLead } from "@/lib/ai";
import { createLeadSchema, updateLeadSchema, deleteLeadSchema } from "@/lib/validations/lead";
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
    try {
    // Cast to NextRequest to get searchParams easily
    const nextRequest = request as NextRequest;
    const searchParams = nextRequest.nextUrl.searchParams;
    const category = searchParams.get("category");
    
        // Fetch leads from database first
        let dbLeads = await prisma.lead.findMany({
          where: {
            organizationId: user.organizationId,
            ...(category && { category: category.toUpperCase() }),
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Transform database leads to match the expected format
        const leads = dbLeads.map(lead => ({
          timestamp: lead.createdAt.toISOString(),
          name: lead.name,
          email: lead.email,
          phone: lead.phone || "",
          score: lead.score,
          category: lead.category || "General",
          status: lead.status,
          source: lead.source || "Website",
        }));

        return NextResponse.json({ leads });
    } catch (error) {
        console.error("Error fetching leads from database:", error);
        return NextResponse.json({ error: "Failed to fetch leads", leads: [] }, { status: 500 });
    }
});


export const POST = withOrgAuth(async (user, request: Request) => {
    const json = await request.json();
    const validation = createLeadSchema.safeParse(json);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data", details: validation.error.flatten() }, { status: 400 });
    }

    const body = validation.data;

    // 1. AI Enrichment
    let analysis = { score: 0, category: "General", summary: "" };
    try {
       analysis = await analyzeLead({
        name: body.name,
        email: body.email,
        message: (body as any).message || (body as any).notes
      });
    } catch (e) {
      console.warn("AI Analysis failed, proceeding with defaults");
    }

    const leadData = {
        ...body,
        score: analysis.score,
        category: analysis.category || body.category || "General",
        status: "NEW",
        source: body.source || "Website",
        timestamp: new Date().toISOString()
    };

    const sheetId = await getSheetId(user.organizationId);

    // 2. Save to Google Sheets
    const success = await addLead({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || "",
        score: leadData.score,
        category: leadData.category,
        status: leadData.status,
        source: leadData.source
    }, sheetId);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to add lead to Google Sheets" }, { status: 500 });
    }

    // 3. Save to Database & Log Activity
    // Sync to DB
    try {
        await prisma.lead.create({
            data: {
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                source: leadData.source,
                status: leadData.status,
                category: leadData.category,
                score: leadData.score,
                organizationId: user.organizationId
            }
        });
    } catch (dbError) {
        console.error("Failed to sync lead to DB:", dbError);
    }

    // Log Activity
    await logActivity(
        user.organizationId,
        ActionType.CREATE,
        "LEAD",
        `New lead created: ${leadData.name}`,
        { id: user.id, name: user.name },
        leadData.email, // using email as entity ID for now
        { source: leadData.source, score: leadData.score }
    );

    return NextResponse.json({ 
        success: true, 
        enriched: {
            score: analysis.score,
            category: analysis.category,
            summary: analysis.summary
        }
    });
});

export const PUT = withOrgAuth(async (user, request: Request) => {
    const json = await request.json();
    const validation = updateLeadSchema.safeParse(json);
    
    if (!validation.success) {
       return NextResponse.json({ error: "Invalid request data", details: validation.error.flatten() }, { status: 400 });
    }

    const { originalLead, newLead } = validation.data;
    const sheetId = await getSheetId(user.organizationId);
    
    const success = await updateLead(originalLead, newLead, sheetId);

    if (!success) {
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
    }

    // Log Activity
    await logActivity(
        user.organizationId,
        ActionType.UPDATE,
        "LEAD",
        `Lead updated: ${newLead.name}`,
        { id: user.id, name: user.name },
        newLead.email,
        { oldStatus: (originalLead as any).status, newStatus: newLead.status }
    );
    
    return NextResponse.json({ success: true });
});

export const DELETE = withOrgAuth(async (user, request: Request) => {
    const json = await request.json();
    const validation = deleteLeadSchema.safeParse(json);

    if (!validation.success) {
        return NextResponse.json({ error: "Invalid request data", details: validation.error.flatten() }, { status: 400 });
    }

    const body = validation.data;
    const sheetId = await getSheetId(user.organizationId);

    const success = await deleteLead(body, sheetId);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
    }

    await logActivity(
        user.organizationId,
        ActionType.DELETE,
        "LEAD",
        `Lead deleted: ${body.email}`,
        { id: user.id, name: user.name },
        body.email
    );
    
    // Also delete from DB
    try {
        await prisma.lead.deleteMany({
            where: { 
                email: body.email,
                organizationId: user.organizationId
            }
        });
    } catch (e) {
        console.error("Failed to delete lead from DB", e);
    }

    return NextResponse.json({ success: true });
});
