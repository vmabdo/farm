import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  // Exclude static assets, api routes if open, Next internals etc
  if (
    currentPath.startsWith('/_next') ||
    currentPath.startsWith('/images/') ||
    currentPath.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  const session = await getAuthSession();

  // If missing or expired session on protected routes
  if (!session && currentPath !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If active session, boot away from login page to dashboard
  if (session && currentPath === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
