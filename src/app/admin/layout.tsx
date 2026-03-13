"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Button, ConfigProvider, theme, Drawer } from "antd";
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

const { Sider, Content } = Layout;

const NAV = [
    { key: "/admin/users", label: "Users", icon: <UsersIcon className="w-5 h-5" /> },
    { key: "/admin/media", label: "Media", icon: <PhotoIcon className="w-5 h-5" /> },
    { key: "/admin/templates", label: "Templates", icon: <DocumentDuplicateIcon className="w-5 h-5" /> },
    { key: "/admin/site-pages", label: "Site Pages", icon: <DocumentDuplicateIcon className="w-5 h-5" /> },
    { key: "/admin/inquiries", label: "Inquiries", icon: <DocumentDuplicateIcon className="w-5 h-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileVisible, setMobileVisible] = useState(false);

    useEffect(() => {
        if (!isLoading && user && (user as any).role !== "admin") {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    if (isLoading || !user) return (
        <div className="h-dvh flex items-center justify-center bg-neutral-950">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
        </div>
    );
    if ((user as any).role !== "admin") return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-neutral-950 border-r border-white/5">
            {/* Logo */}
            <div className={`flex items-center gap-3 h-16 px-5 border-b border-white/5 ${collapsed ? 'justify-center px-0' : ''}`}>
                <div className="w-8 h-8 shrink-0 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <BoltIcon className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="font-black text-sm text-white tracking-tight leading-none">PageCraft</p>
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Admin</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto pt-4 px-2">
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={NAV}
                    onClick={({ key }) => {
                        router.push(key);
                        setMobileVisible(false);
                    }}
                    className="bg-transparent border-none"
                    style={{ background: 'transparent' }}
                />
            </div>

            {/* Footer / User Profile */}
            <div className="p-2 sm:p-4 border-t border-white/5 space-y-4">
                {!collapsed && (
                    <div 
                        className="flex items-center gap-3 p-2 sm:p-3 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/profile")}
                    >
                        { (user as any)?.profilePic ? (
                            <img src={(user as any).profilePic} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shrink-0" />
                        ) : (
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white shrink-0">
                                {(user?.name || "A").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
                            <p className="text-[9px] sm:text-[10px] text-white/40 truncate">{user?.email}</p>
                        </div>
                    </div>
                )}

                <Button
                    type="text"
                    danger
                    icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                    onClick={handleLogout}
                    className={`w-full flex! items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-11 rounded-xl hover:bg-red-500/10! font-bold text-sm text-red-400`}
                >
                    {!collapsed && "Log out"}
                </Button>
            </div>
        </div>
    );

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#6366f1',
                    borderRadius: 12,
                    colorBgContainer: '#0a0a0a',
                    colorBorderSecondary: 'rgba(255,255,255,0.05)',
                },
                components: {
                    Menu: {
                        itemBg: 'transparent',
                        itemSelectedBg: 'rgba(99,102,241,0.1)',
                        itemSelectedColor: '#818cf8',
                        itemHoverBg: 'rgba(255,255,255,0.03)',
                        itemColor: '#94a3b8',
                        itemHoverColor: '#f8fafc',
                        fontFamily: 'inherit',
                    }
                }
            }}
        >
            <Layout className="h-dvh bg-neutral-950 overflow-hidden flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-neutral-950 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <BoltIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-sm text-white tracking-widest uppercase italic">PageCraft</span>
                    </div>
                    <Button
                        type="text"
                        icon={<Bars3Icon className="w-7 h-7 text-white" />}
                        onClick={() => setMobileVisible(true)}
                        className="hover:bg-white/5!"
                    />
                </div>

                <Layout className="flex-1 overflow-hidden relative">
                    {/* Sidebar Drawer for Mobile */}
                    <Drawer
                        placement="left"
                        onClose={() => setMobileVisible(false)}
                        open={mobileVisible}
                        // size="small"
                        styles={{ body: { padding: 0 } }}
                        closable={false}
                        className="bg-neutral-950"
                    >
                        <SidebarContent />
                    </Drawer>

                    {/* Sidebar for Desktop */}
                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        width={240}
                        collapsedWidth={80}
                        className="hidden lg:block relative transition-all duration-300 border-r border-white/5"
                        style={{ background: '#0a0a0a' }}
                    >
                        <SidebarContent />

                        {/* Unique Toggle Button */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-50 transition-all active:scale-90"
                        >
                            {collapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronLeftIcon className="w-3.5 h-3.5" />}
                        </button>
                    </Sider>

                    {/* Main Content */}
                    <Content className="overflow-auto scrollbar-hide bg-neutral-950">
                        <div className="min-h-full">
                            {children}
                        </div>
                    </Content>
                </Layout>
            </Layout>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .ant-menu-item {
                    margin-bottom: 4px !important;
                    height: 44px !important;
                    line-height: 44px !important;
                    border-radius: 12px !important;
                }
                .ant-menu-item-icon {
                    width: 20px !important;
                    height: 20px !important;
                }
            `}</style>
        </ConfigProvider>
    );
}
