import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Avoid caching issues for legal data
      cache: "no-store",
    });

    if (!response.ok) {
        // Return a friendly error if the remote API fails
        const errorText = await response.text();
        return NextResponse.json({ 
            error: `Remote API failed: ${response.status} ${response.statusText}`,
            detail: errorText 
        }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ 
        error: "Failed to fetch from remote API",
        message: err.message 
    }, { status: 500 });
  }
}
