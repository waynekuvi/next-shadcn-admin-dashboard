import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export type AuthenticatedUser = {
  id: string;
  email: string;
  organizationId: string | null;
  role: string;
  orgRole: string | null;
  name?: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession();
  
  if (!session?.user) {
    return null;
  }

  const user = session.user;
  
  return {
    id: user.id,
    email: user.email || "",
    organizationId: user.organizationId || null,
    role: user.role || "CLIENT",
    orgRole: user.orgRole || null,
    name: user.name || null
  };
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireOrgAuth() {
  const user = await requireAuth();
  if (!user.organizationId) {
    throw new Error("Organization Required");
  }
  return { ...user, organizationId: user.organizationId }; // Typescript narrowing
}

// Wrapper for API Routes to standardize error handling and auth
export function withAuth(
  handler: (user: AuthenticatedUser, req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      const user = await getAuthenticatedUser();
      
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return await handler(user, req, context);
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

// Wrapper for Org-Scoped API Routes
export function withOrgAuth(
  handler: (user: AuthenticatedUser & { organizationId: string }, req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      const user = await getAuthenticatedUser();
      
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      if (!user.organizationId) {
          return NextResponse.json({ error: "Organization Context Required" }, { status: 403 });
      }

      return await handler({ ...user, organizationId: user.organizationId }, req, context);
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

