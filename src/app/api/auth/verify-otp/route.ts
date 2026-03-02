import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const res = await fetch(`${BACKEND}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    const { accessToken, refreshToken, user } = data;

    const response = NextResponse.json({ user });

    response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("accessToken", accessToken, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
    });

    return response;
}
