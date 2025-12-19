import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

// Initialize NextAuth handler
const handler = NextAuth(authOptions);

// Export handlers - NextAuth expects these exact signatures
export const GET = handler;
export const POST = handler;

