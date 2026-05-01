"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export default function SitePageClient({ pageContent }: { pageContent: any }) {
    const router = useRouter();
    const trustedBackendHtml = pageContent?.content || "";

    useEffect(() => {
        if (!pageContent) {
            router.replace('/');
        }
    }, [pageContent, router]);

    if (!pageContent) return null;

    return (
        <div style={{ minHeight: "100dvh", background: "#06060e", display: "flex", flexDirection: "column" }}>
            <Header />
            <main style={{ flex: 1, paddingTop: "100px", paddingBottom: "100px" }}>
                <Container size="md">
                    <h1 style={{
                        fontSize: "3rem",
                        fontWeight: 800,
                        color: "white",
                        marginBottom: "2rem",
                        textAlign: "center"
                    }}>
                        {pageContent.title}
                    </h1>
                    <div
                        className="prose prose-invert max-w-none"
                        style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                        // Public site pages currently store authored HTML from the backend.
                        // Keep output unchanged here; sanitization belongs at the write/API boundary
                        // so saved pages are cleaned consistently before every frontend consumes them.
                        dangerouslySetInnerHTML={{ __html: trustedBackendHtml }}
                    />
                </Container>
            </main>
            <Footer />
        </div>
    );
}
