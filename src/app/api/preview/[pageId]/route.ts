import { NextResponse } from "next/server";



// In development, Next.js clears module scope on reloads.
// We use the global object to persist the preview data in memory across hot-reloads.
const globalStore = global as unknown as { __previewData?: Record<string, any> };
if (!globalStore.__previewData) {
    globalStore.__previewData = {};
}

export async function POST(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;
        const data = await req.json();
        globalStore.__previewData![pageId] = data;
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;
        const data = globalStore.__previewData![pageId];
        if (!data) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
