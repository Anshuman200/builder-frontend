"use client";

import { Layout } from "antd";
import { Header as CustomHeader } from "@/components/landing/Header";
import { Footer as CustomFooter } from "@/components/landing/Footer";
import { usePathname, useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { useEffect } from "react";

const { Content } = Layout;

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
 
    useEffect(() => {
        const authParam = searchParams?.get("auth");
        if (authParam === "login" || authParam === "register") {
            window.dispatchEvent(new CustomEvent('show-auth-modal', { detail: { reason: authParam } }));
        }
    }, [searchParams]);

    return (
        <Layout className="min-h-screen bg-[#080808] relative overflow-x-hidden font-sans">
            {/* 
               Premium Background Effects - Centralized in Layout
               These will be visible across ALL public pages (Landing, Templates, etc.)
            */}
            <div className="fixed top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-radial-gradient from-indigo-600/20 to-transparent blur-[120px] rounded-full pointer-events-none z-0 transition-opacity duration-1000 will-change-transform" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-radial-gradient from-blue-600/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0 transition-opacity duration-1000 will-change-transform" />

            {/* Shared Header Component */}
            <CustomHeader onLoginClick={() => window.dispatchEvent(new CustomEvent('show-auth-modal', { detail: { reason: 'login' } }))} />

            {/* Main Content Area */}
            <Content className="relative z-10 flex flex-col min-h-screen">
                <PageTransition pathname={pathname}>
                    {children}
                </PageTransition>
            </Content>

            {/* Shared Footer Component */}
            <CustomFooter />



            <style jsx global>{`
                .bg-radial-gradient {
                    background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Layout>
    );
}
