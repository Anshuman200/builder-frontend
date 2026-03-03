import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Expire both cookies
    response.cookies.set("accessToken", "", {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    response.cookies.set("hasSession", "", {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
