import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define paths that require authentication
const protectedPaths = [
  '/',
  '/profile',
  '/matches',
  '/messages',
  '/settings',
  '/discover',
];

// Define API paths that require authentication
const protectedApiPaths = [
  '/api/user',
  '/api/profile',
  '/api/matches',
  '/api/messages',
  '/api/settings',
  '/api/discover',
];

// Define paths that should redirect to home if user is already authenticated
const authPaths = ['/auth/signin', '/auth/signup'];

// Define API paths that should be accessible without authentication
const publicApiPaths = ['/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    path === '/' ? pathname === path : pathname.startsWith(path)
  );

  // Check if the path is a protected API path
  const isProtectedApiPath = protectedApiPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the path is an auth path (signin/signup)
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Check if the path is a public API path
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isPublicApiPath = publicApiPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Get the token from the request
  const token = await getToken({ req: request });

  // If the path is protected and there's no token, redirect to signin
  if (isProtectedPath && !token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If the path is a protected API path and there's no token, return 401
  if (isProtectedApiPath && !token) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // If the path is an auth path and there's a token, redirect to home
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Otherwise, continue to the requested page
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
