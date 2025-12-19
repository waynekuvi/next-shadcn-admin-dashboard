import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// Initialize Lucia with Prisma adapter
// PrismaAdapter(sessionModel, userModel)
// Session model needs: id, userId, expiresAt
// User model needs: id
let adapter: any;
try {
  adapter = new PrismaAdapter(prisma.session, prisma.user);
  console.log("✅ PrismaAdapter initialized");
} catch (error) {
  console.error("❌ PrismaAdapter initialization failed:", error);
  throw error;
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "auth_session",
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      name: attributes.name,
      image: attributes.image,
      role: attributes.role,
      organizationId: attributes.organizationId,
      orgRole: attributes.orgRole,
    };
  },
});

// Type declarations
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      email: string | null;
      name: string | null;
      image: string | null;
      role: string;
      organizationId: string | null;
      orgRole: string | null;
    };
  }
}

// Helper to get session
export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("auth_session")?.value ?? null;
  if (!sessionId) return null;
  
  try {
    const { session, user } = await lucia.validateSession(sessionId);
    return { session, user };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

// Helper to require auth (throws if not authenticated)
export async function requireAuth() {
  const { session, user } = await getSession();
  if (!session || !user) {
    throw new Error("Unauthorized");
  }
  return { session, user };
}

