import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3019/api";

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
        return NextResponse.json({ message: "No refresh token found" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        // If refresh fails (expired or invalid), clear cookies
        const response = NextResponse.json(data, { status: res.status });
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
    }

    const { accessToken } = data;

    const response = NextResponse.json({ success: true });

    // Non-httpOnly accessToken — readable by JS so API client can forward it to external backend
    response.cookies.set("accessToken", accessToken, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
    });

    return response;
}
