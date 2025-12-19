import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { z } from "zod";
// import { compare } from "bcryptjs"; // We'll need to install this

const sanitizeImageValue = (image?: string | null) => {
  if (!image || typeof image !== "string") return undefined;
  if (image.startsWith("data:")) return undefined;
  if (image.length > 2048) return undefined;
  return image;
};

export const authOptions: NextAuthOptions = {
  // Note: CredentialsProvider requires JWT sessions, not database sessions
  // We don't need PrismaAdapter for JWT sessions
  // So we use JWT but with minimal cookie configuration
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only", // Required for NextAuth
  debug: process.env.NODE_ENV === "development", // Enable debug logging
  session: {
    strategy: "jwt", // Required for CredentialsProvider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0, // Expire immediately to prevent accumulation
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60, // Short-lived CSRF token
      },
    },
  },
  pages: {
    signIn: "/auth/v2/login",
    newUser: "/onboarding", // Redirect here after sign up
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
          // Basic mock auth for now since we are building the system
          // In production you would look up user by email & verify password
          // But for now let's just allow sign in if email exists or create them

          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }
          
          try {
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                organizationId: true,
                orgRole: true,
                image: true,
              }
            });

            // For MVP simplicity: If user doesn't exist, create them (auto-signup)
            if (!user) {
              try {
                const newUser = await prisma.user.create({
                  data: {
                    email: credentials.email,
                    name: credentials.email.split("@")[0],
                    role: "CLIENT",
                  },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    organizationId: true,
                    orgRole: true,
                    image: true,
                  }
                });
                console.log("User created:", newUser.id);
                return newUser;
              } catch (error) {
                console.error("Error creating user:", error);
                return null; // Fail gracefully if creation fails (e.g. duplicate race condition)
              }
            }

            console.log("User found:", user.id);
            return user;
          } catch (error) {
            console.error("Database error during authorize:", error);
            return null;
          }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // CRITICAL FIX: Always return a simple relative path to prevent callback URL cookies
      // This prevents NextAuth from creating cookies with encoded URLs in the name
      
      // If already a relative path, use it directly
      if (url && url.startsWith("/")) {
        return url;
      }
      
      // If absolute URL, validate and extract path
      if (url && baseUrl) {
        try {
          // Ensure baseUrl is valid
          const base = baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;
          const urlObj = new URL(url, base);
          
          // Only allow same origin
          if (urlObj.origin === new URL(base).origin) {
            return urlObj.pathname + urlObj.search;
          }
        } catch (error) {
          // If URL parsing fails, log and use default
          console.error("Redirect URL parsing error:", error);
            }
      }
      
      // Always return a simple relative path - never return full URLs
      return "/dashboard/overview";
    },
    async jwt({ token, user }) {
      // JWT sessions: user is provided on first sign in
      // Only store minimal data to keep JWT small
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId || null;
        token.orgRole = (user as any).orgRole || null;
        token.image = sanitizeImageValue((user as any).image);
      }
      return token;
    },
    async session({ session, token }) {
      // JWT sessions: token contains the user data
      // Only return minimal session data to keep cookie size small
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string;
        (session.user as any).role = token.role;
        (session.user as any).organizationId = token.organizationId || null;
        (session.user as any).orgRole = token.orgRole || null;
        if (token.image) {
          (session.user as any).image = token.image as string;
        }
      }
      return session;
    }
  }
};

