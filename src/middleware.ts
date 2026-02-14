import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware: Admin routes protection with Basic Authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') || isAdminApiRoute(pathname, request.method)) {
    return handleAdminAuth(request);
  }

  return NextResponse.next();
}

function isAdminApiRoute(pathname: string, method: string): boolean {
  // POST (create) and DELETE on /api/reservations require admin auth
  if (pathname === '/api/reservations' && (method === 'POST' || method === 'DELETE')) {
    return true;
  }
  return false;
}

function handleAdminAuth(request: NextRequest): NextResponse {
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const encodedCredentials = authHeader.split(' ')[1];
    if (encodedCredentials) {
      const decodedCredentials = atob(encodedCredentials);
      const [username, password] = decodedCredentials.split(':');

      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (username === 'admin' && password === adminPassword) {
        return NextResponse.next();
      }
    }
  }

  // Return 401 with Basic Auth challenge
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Smart Check-in Admin"',
    },
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/reservations',
  ],
};
