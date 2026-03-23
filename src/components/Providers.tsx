"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/hooks/useToasts";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ConfigProvider, theme, App } from "antd";
import { AuthModal } from "@/components/auth/AuthModal";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
    const [authOpen, setAuthOpen] = useState(false);
    const [authForced, setAuthForced] = useState(false);
    const pathname = usePathname();

    const isLandingPage = pathname === "/";

    useEffect(() => {
        const handleShowAuth = (e: any) => {
            setAuthForced(e.detail?.reason === "session_expired");
            setAuthOpen(true);
        };
        window.addEventListener('show-auth-modal', (handleShowAuth as EventListener));
        return () => window.removeEventListener('show-auth-modal', (handleShowAuth as EventListener));
    }, []);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 min
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange={false}
                storageKey="pagecraft-theme"
            >
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,
                        token: {
                            colorPrimary: '#6366f1', // Indigo 500
                            colorBgBase: '#000000',
                            colorBgContainer: '#0a0a0a',
                            colorBgElevated: '#171717',
                            colorBorder: '#262626',
                            borderRadius: 8,
                            fontFamily: 'inherit',
                            zIndexPopupBase: 10000, // Ensure AntD popups (toasts) are above everything
                        },
                        components: {
                            Card: {
                                colorBgContainer: '#0a0a0a',
                            },
                        }
                    }}
                >
                    <App>
                        <ToastProvider>
                            <AuthProvider>
                                {children}
                                <ToastContainer />
                                <AuthModal 
                                    open={authOpen} 
                                    onClose={() => { setAuthOpen(false); setAuthForced(false); }} 
                                    redirectOnSuccess={isLandingPage} 
                                    forced={authForced}
                                />
                            </AuthProvider>
                        </ToastProvider>
                    </App>
                </ConfigProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
