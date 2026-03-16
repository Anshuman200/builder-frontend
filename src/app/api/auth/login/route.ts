import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3019/api";

export async function POST(req: NextRequest) {
    const body = await req.json();

    let res;
    try {
        res = await fetch(`${BACKEND}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (error: any) {
        console.error("[Login Proxy] Fetch failed:", error);
        return NextResponse.json({ message: "Failed to connect to backend service.", details: error.message }, { status: 502 });
    }

    let data;
    try {
        data = await res.json();
    } catch (error: any) {
        console.error("[Login Proxy] JSON parsing failed:", error);
        return NextResponse.json({ message: "Invalid response from backend service." }, { status: 502 });
    }

    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    const { accessToken, refreshToken, user } = data;
    const isAdmin = user?.role === 'admin';

    const response = NextResponse.json({
        user,
        redirectTo: isAdmin ? '/admin' : '/home'
    });

    // httpOnly refreshToken — cannot be read by JS (secure from XSS)
    response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Non-httpOnly accessToken — readable by JS so API client can forward it to external backend
    response.cookies.set("accessToken", accessToken, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
    });

    // Client-side session indicator
    response.cookies.set("hasSession", "true", {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Role cookie for middleware-level route protection (non-httpOnly so middleware can read it)
    response.cookies.set("userRole", user?.role ?? "user", {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
}
