import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-lucia";

export async function GET() {
  try {
    const result = await getSession();
    
    if (!result || !result.session || !result.user) {
      return NextResponse.json({ user: null });
    }
    
    const { session, user } = result;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        organizationId: user.organizationId,
        orgRole: user.orgRole,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}

