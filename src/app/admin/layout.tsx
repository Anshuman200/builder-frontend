"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ConfigProvider, theme, Drawer } from "antd";
import {
    UsersIcon,
    DocumentDuplicateIcon,
    BoltIcon,
    ArrowRightOnRectangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PhotoIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/layout/PageTransition";

const NAV = [
    { key: "/admin/users", label: "Users", icon: UsersIcon },
    { key: "/admin/media", label: "Media", icon: PhotoIcon },
    { key: "/admin/templates", label: "Templates", icon: DocumentDuplicateIcon },
    { key: "/admin/site-pages", label: "Site Pages", icon: DocumentDuplicateIcon },
    { key: "/admin/page-tags", label: "Page Tags", icon: DocumentDuplicateIcon },
    { key: "/admin/inquiries", label: "Inquiries", icon: DocumentDuplicateIcon },
];

const SidebarContent = ({ collapsed, pathname, router, setMobileVisible, user, handleLogout }: any) => (
    <div className="flex flex-col h-full bg-neutral-950 border-r border-white/5 selection:bg-indigo-500/30">
        <div className={`flex items-center gap-3 h-16 border-b border-white/5 transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
            <div className="w-9 h-9 shrink-0 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BoltIcon className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
                <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                    <p className="font-black text-sm text-white tracking-tight leading-none uppercase">Solario Forge</p>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
            {NAV.map((item) => {
                const isActive = pathname === item.key;
                const Icon = item.icon;
                return (
                    <button
                        key={item.key}
                        onClick={() => {
                            router.push(item.key);
                            setMobileVisible(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${isActive
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                        <div className={`shrink-0 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-indigo-400'}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        {!collapsed && <span className="text-xs uppercase tracking-widest">{item.label}</span>}
                    </button>
                );
            })}
        </div>

        <div className="p-3 border-t border-white/5 flex flex-col gap-3">
            {!collapsed && (
                <button
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group overflow-hidden"
                    onClick={() => router.push("/admin/profile")}
                >
                    {(user as any)?.profilePic ? (
                        <img src={(user as any).profilePic} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-white/10" />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-indigo-500/20">
                            {(user?.name || "A").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0 text-left">
                        <p className="text-xs font-black text-white truncate uppercase tracking-tight">{user?.name || "Admin"}</p>
                        <p className="text-[10px] font-bold text-white/30 truncate uppercase tracking-widest">{user?.email}</p>
                    </div>
                </button>
            )}

            <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 h-12 rounded-2xl hover:bg-red-500/10 transition-colors font-black text-xs uppercase tracking-widest text-red-400 group ${collapsed ? 'justify-center' : 'px-4'}`}
            >
                <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                {!collapsed && "Log out"}
            </button>
        </div>
    </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileVisible, setMobileVisible] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) return (
        <div className="h-screen flex items-center justify-center bg-neutral-950">
            <div className="w-10 h-10 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
    );
    if ((user as any).role !== "admin") return null;

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#6366f1',
                    borderRadius: 16,
                    colorBgContainer: '#0a0a0a',
                    colorBorderSecondary: 'rgba(255,255,255,0.05)',
                },
                components: {
                    Table: {
                        headerBg: 'rgba(255,255,255,0.02)',
                        headerColor: 'rgba(255,255,255,0.4)',
                        borderRadius: 24,
                    }
                }
            }}
        >
            <div className="h-screen bg-neutral-950 overflow-hidden flex flex-col font-sans selection:bg-indigo-500/30 text-white">
                <div className="lg:hidden h-16 px-6 flex items-center justify-between border-b border-white/5 bg-neutral-950 shrink-0 z-40">
                    <Link
                        href={!user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home"}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <BoltIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-sm text-white tracking-widest uppercase">Solario Forge</span>
                    </Link>
                    <button
                        onClick={() => setMobileVisible(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    <Drawer
                        placement="left"
                        onClose={() => setMobileVisible(false)}
                        open={mobileVisible}
                        styles={{ body: { padding: 0 } }}
                        closable={false}
                        className="[&_.ant-drawer-content]:bg-neutral-950"
                        size={280}
                    >
                        <SidebarContent
                            collapsed={false}
                            pathname={pathname}
                            router={router}
                            setMobileVisible={setMobileVisible}
                            user={user}
                            handleLogout={handleLogout}
                        />
                    </Drawer>

                    <div className={`hidden lg:flex flex-col relative transition-all duration-500 ease-in-out border-r border-white/5 bg-neutral-950 ${collapsed ? 'w-20' : 'w-64'}`}>
                        <SidebarContent
                            collapsed={collapsed}
                            pathname={pathname}
                            router={router}
                            setMobileVisible={setMobileVisible}
                            user={user}
                            handleLogout={handleLogout}
                        />
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="absolute -right-3 top-20 w-7 h-7 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 border border-indigo-400 shadow-xl shadow-indigo-500/40 z-50 transition-all hover:scale-110 active:scale-95"
                        >
                            {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                        </button>
                    </div>

                    <main className="flex-1 overflow-auto scrollbar-hide bg-neutral-950 relative">
                        <PageTransition pathname={pathname} className="min-h-full p-4 sm:p-8 lg:p-12">
                            {children}
                        </PageTransition>
                    </main>
                </div>
            </div>
        </ConfigProvider>
    );
}
