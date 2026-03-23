"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export default function SitePageClient({ pageContent }: { pageContent: any }) {
    const router = useRouter();

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
                        dangerouslySetInnerHTML={{ __html: pageContent.content }}
                    />
                </Container>
            </main>
            <Footer />
        </div>
    );
}
