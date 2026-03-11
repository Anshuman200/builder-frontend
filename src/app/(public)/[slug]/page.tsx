"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { useSitePage } from "@/lib/api/queries";

export default function SitePageViewer() {
    const params = useParams();
    const router = useRouter();
    const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
    
    const { data: pageContent, isLoading, isError } = useSitePage(slug);

    useEffect(() => {
        if (isError) {
            router.replace('/');
        }
    }, [isError, router]);

    if (isLoading) {
        return (
            <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
                <Header />
                <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                </main>
                <Footer />
            </div>
        );
    }

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
