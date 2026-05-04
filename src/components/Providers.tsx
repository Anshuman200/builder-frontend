"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/hooks/useToasts";
import { CustomToaster } from "@/components/ui/CustomToaster";
import { ConfigProvider, theme, App } from "antd";
import { AuthModal } from "@/components/auth/AuthModal";
import { usePathname } from "next/navigation";

/**
 * AntdThemeProvider: A sub-component that reacts to theme changes
 * from next-themes and updates the Ant Design ConfigProvider.
 */
function AntdThemeProvider({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#6366f1', // Indigo 500
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    zIndexPopupBase: 10000,
                    // If dark mode, use custom refined dark tokens; 
                    // if light mode, let defaultAlgorithm handle it or specify light tokens.
                    ...(isDark ? {
                        colorBgBase: '#000000',
                        colorBgContainer: '#0a0a0a',
                        colorBgElevated: '#171717',
                        colorBorder: '#262626',
                    } : {
                        colorBgBase: '#ffffff',
                        colorBgContainer: '#ffffff',
                        colorBgElevated: '#ffffff',
                        colorBorder: '#e2e8f0',
                    }),
                },
                components: {
                    Card: {
                        colorBgContainer: isDark ? '#0a0a0a' : '#ffffff',
                    },
                    Layout: {
                        bodyBg: "transparent", // Let the global CSS handle body background
                        headerBg: "transparent",
                    }
                }
            }}
        >
            <App className="min-h-screen">
                {children}
            </App>
        </ConfigProvider>
    );
}

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

    const isPreview = pathname?.startsWith("/preview") || pathname?.startsWith("/editor");

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme={isPreview ? "light" : "dark"}
                forcedTheme={isPreview ? "light" : undefined}
                enableSystem={!isPreview}
                disableTransitionOnChange={false}
                storageKey="pagecraft-theme"
            >
                <AntdThemeProvider>
                    <ToastProvider>
                        <AuthProvider>
                            {children}
                            <CustomToaster />
                            <AuthModal
                                open={authOpen}
                                onClose={() => { setAuthOpen(false); setAuthForced(false); }}
                                redirectOnSuccess={isLandingPage}
                                forced={authForced}
                            />
                        </AuthProvider>
                    </ToastProvider>
                </AntdThemeProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
