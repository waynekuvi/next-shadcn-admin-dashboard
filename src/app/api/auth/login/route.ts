import { NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth-lucia";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    console.log("Login attempt for:", email);

    // Find or create user (simplified - in production, verify password)
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("Creating new user:", email);
      // Auto-create user for MVP (in production, use proper registration)
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          role: "CLIENT",
        },
      });
    }

    console.log("User found/created:", user.id);

    // Create session
    console.log("Creating session for user:", user.id);
    const session = await lucia.createSession(user.id, {});
    console.log("Session created:", session.id);

    // Set session cookie
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    console.log("Session cookie set");

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        orgRole: user.orgRole,
      },
    });
  } catch (error: any) {
    console.error("Login error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Login failed", 
        message: error?.message || "Unknown error",
        ...(process.env.NODE_ENV === "development" && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}

