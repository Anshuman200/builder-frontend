import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const isAuthed = !!(accessToken || refreshToken);

    // Redirect logged-in users away from the landing page
    if (pathname === '/' && isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users away from protected routes
    const protectedPaths = ['/dashboard'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected && !isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('auth', 'login');
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};