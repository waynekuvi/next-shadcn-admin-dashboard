import { NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth-lucia";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    console.log("Registration attempt for:", email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Create user (password validation is done but not stored - matches current MVP approach)
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        role: "CLIENT",
      },
    });

    console.log("User created:", user.id);

    // Create session
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
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

