import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";
import { OrgRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { joinCode } = await req.json();

    const organization = await prisma.organization.findUnique({
      where: { joinCode },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ message: "Invalid organization code" }, { status: 404 });
    }

    // Determine Role: If first user (count=0), make OWNER. Else MEMBER.
    const orgRole = organization._count.users === 0 ? OrgRole.OWNER : OrgRole.MEMBER;

    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        organizationId: organization.id,
        orgRole: orgRole
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
