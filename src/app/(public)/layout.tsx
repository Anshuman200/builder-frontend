"use client";

import { Layout } from "antd";
import { Header as CustomHeader } from "@/components/landing/Header";
import { Footer as CustomFooter } from "@/components/landing/Footer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const { Content } = Layout;

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirection logic: Logged-in users should not access public routes
        if (!isLoading && user) {
            router.replace("/home");
            return;
        }

        const authParam = searchParams?.get("auth");
        console.log('authParam', authParam)
        if ((authParam === "login" || authParam === "register" || authParam === "reset-password" || authParam === "verify") && !user) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('show-auth-modal', { detail: { reason: authParam } }));
            }, 0);
            // Clear the param from URL to prevent re-triggering for login/register
            if (authParam !== "reset-password" && authParam !== "verify") {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("auth");
                const newQuery = params.toString();
                router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`);
            }
        }
    }, [searchParams, user, isLoading, router]);

    // Prevent flickering while loading: Do not render public layout if isLoading
    if (isLoading) {
        return null;
    }

    return (
        <Layout className="min-h-screen bg-transparent relative overflow-x-hidden font-sans">
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
        </Layout>
    );
}
