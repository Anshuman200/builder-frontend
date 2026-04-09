import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // For admin check, we might want to check a 'hasAdmin' cookie if we had one,
    // but the backend uses the JWT role. For the middleware redirect, we'll
    // check a non-httpOnly 'user_role' cookie if we added one, otherwise 
    // we'll default to /home.
    const userRole = request.cookies.get('user_role')?.value;
    const hasSession = request.cookies.get('hasSession')?.value === 'true';

    // DEBUG: Server-side cookie check
    console.log(`[Middleware] ${pathname} - hasSession: ${hasSession}, userRole: ${userRole}, hasAccessToken: ${!!accessToken}`);

    const isAuthed = !!(accessToken || refreshToken || hasSession || userRole);
    const isAdmin = userRole === 'admin';

    // DEBUG: Server-side cookie check
    console.log(`[Middleware] Path: ${pathname}, isAuthed: ${isAuthed}, hasSession: ${hasSession}`);

    // Redirect logged-in users away from the landing page
    if (pathname === '/' && isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = isAdmin ? '/admin' : '/home';
        url.search = '';
        return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users away from protected routes
    const protectedPaths = ['/admin', '/home', '/templates', '/media', '/domains'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected && !isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('auth', 'login');
        return NextResponse.redirect(url);
    }

    // Redirect non-admin users away from /admin
    if (pathname.startsWith('/admin') && isAuthed && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/home';
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