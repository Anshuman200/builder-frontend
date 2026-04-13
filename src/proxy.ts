import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy to handle authentication and routing.
 * Checks for access_token and refresh_token in cookies.
 */
export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Retrieve cookies
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    const isAuthed = !!accessToken || !!refreshToken;
    const isAdmin = userRole === 'admin';

    // Log authentication status for debugging in production
    console.log(`[Proxy] ${pathname} - isAuthed: ${isAuthed}, hasAccessToken: ${!!accessToken}`);

    // 1. Redirect logged-in users away from the landing page
    if (pathname === '/' && isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = isAdmin ? '/admin' : '/home';
        // Remove auth=login if it exists
        url.searchParams.delete('auth');
        return NextResponse.redirect(url);
    }

    // 2. Protect routes
    // We check if the pathname starts with any of our dashboard base paths
    const protectedBases = ['/admin', '/home', '/templates', '/media', '/domains'];
    const isProtected = protectedBases.some(base => 
        pathname === base || pathname.startsWith(`${base}/`)
    );

    if (isProtected && !isAuthed) {
        console.log(`[Proxy] Blocking access to ${pathname} - No valid session found. Redirecting to login.`);
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