import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Emergency cookie cleanup route
 * Call this to clear ALL cookies immediately
 */
export async function POST(req: NextRequest) {
  const cookies = req.cookies.getAll();
  const response = NextResponse.json({ 
    success: true, 
    cleared: cookies.length,
    message: "All cookies cleared"
  });

  // Delete ALL cookies aggressively
  cookies.forEach(cookie => {
    const name = cookie.name;
    // Try all combinations to ensure deletion
    const paths = ['/', '/api', '/auth', '/dashboard', '/admin'];
    const secureFlags = [false, true];
    
    paths.forEach(path => {
      secureFlags.forEach(secure => {
        response.cookies.delete(name);
        response.cookies.set({
          name: name,
          value: '',
          expires: new Date(0),
          path: path,
          httpOnly: true,
          sameSite: 'lax',
          secure: secure,
        });
      });
    });
  });

  return response;
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST to clear cookies",
    endpoint: "/api/clear-all-cookies"
  });
}

