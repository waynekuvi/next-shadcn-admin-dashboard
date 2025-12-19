import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API route to clear all next-auth cookies
 * This helps resolve HTTP 431 errors caused by cookie accumulation
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Find all next-auth related cookies (including all possible prefixes)
    const nextAuthCookies = allCookies.filter(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('authjs') ||
      cookie.name.includes('session-token') ||
      cookie.name.includes('csrf-token') ||
      cookie.name.includes('callback-url')
    );

    // Create response with cookies to delete
    const response = NextResponse.json({ 
      success: true, 
      cleared: nextAuthCookies.length,
      cookies: nextAuthCookies.map(c => c.name)
    });

    // Delete each cookie by setting it with an expired date
    // Try multiple paths and domain combinations to ensure deletion
    const paths = ['/', '/dashboard', '/admin', '/auth'];
    const domains = [undefined, 'localhost', '.localhost'];
    
    nextAuthCookies.forEach(cookie => {
      // Delete with standard settings
      response.cookies.set({
        name: cookie.name,
        value: '',
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Set to false to delete both secure and non-secure versions
      });
      
      // Also try with secure flag for production cookies
      if (process.env.NODE_ENV === 'production') {
        response.cookies.set({
          name: cookie.name,
          value: '',
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
        });
      }
    });

    return response;
  } catch (error) {
    console.error("Error clearing cookies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cookies" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const nextAuthCookies = allCookies.filter(cookie => 
    cookie.name.includes('next-auth') || 
    cookie.name.includes('authjs') ||
    cookie.name.includes('session-token') ||
    cookie.name.includes('csrf-token') ||
    cookie.name.includes('callback-url')
  );

  return NextResponse.json({
    count: nextAuthCookies.length,
    cookies: nextAuthCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 50) + (c.value.length > 50 ? '...' : ''),
      size: c.value.length,
    })),
    totalSize: nextAuthCookies.reduce((sum, c) => sum + c.value.length, 0),
  });
}

