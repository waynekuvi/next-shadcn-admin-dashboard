import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role === "ADMIN") {
      const organizations = await prisma.organization.findMany({
        select: { id: true, name: true, logo: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(organizations);
    }

    if (!user.organizationId) {
      return NextResponse.json([], { status: 200 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true, logo: true },
    });

    return NextResponse.json(organization ? [organization] : []);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
