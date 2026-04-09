import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle authentication and routing.
 * Checks for access_token and refresh_token in cookies.
 */
export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Retrieve cookies
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    const isAuthed = !!accessToken || !!refreshToken;
    const isAdmin = userRole === 'admin';

    // Log authentication status for debugging in production
    console.log(`[Middleware] ${pathname} - isAuthed: ${isAuthed}, hasAccessToken: ${!!accessToken}`);

    // 1. Redirect logged-in users away from the landing page
    if (pathname === '/' && isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = isAdmin ? '/admin' : '/home';
        // Remove auth=login if it exists
        url.searchParams.delete('auth');
        return NextResponse.redirect(url);
    }

    // 2. Protect routes
    const protectedPaths = ['/admin', '/home', '/templates', '/media', '/domains', '/editor'];
    const isProtected = protectedPaths.some(
        p => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (isProtected && !isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('auth', 'login');
        return NextResponse.redirect(url);
    }

    // 3. Admin authorization
    if (pathname.startsWith('/admin') && isAuthed && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/home';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};