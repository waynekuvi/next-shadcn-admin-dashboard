import { NextResponse } from "next/server";
import { lucia } from "@/lib/auth-lucia";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("auth_session")?.value ?? null;
    
    if (sessionId) {
      await lucia.invalidateSession(sessionId);
    }

    // Clear session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

