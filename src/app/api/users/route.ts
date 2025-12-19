import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withOrgAuth } from "@/lib/api-middleware";

export const GET = withOrgAuth(async (user, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId") || user.organizationId;

    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        orgRole: true,
        role: true
      },
      orderBy: [
        { name: 'asc' },
        { email: 'asc' }
      ]
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});

