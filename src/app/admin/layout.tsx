"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    UsersIcon,
    DocumentDuplicateIcon,
    BoltIcon,
    ArrowRightOnRectangleIcon,
    ChevronLeftIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
    { href: "/admin/users", label: "Users", icon: UsersIcon, badge: null },
    { href: "/admin/templates", label: "Templates", icon: DocumentDuplicateIcon, badge: null },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

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
        <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
    );
    if ((user as any).role !== "admin") return null;

    const sidebarW = collapsed ? 64 : 220;

    return (
        <div style={{ display: "flex", height: "100dvh", background: "var(--bg)", overflow: "hidden" }}>
            {/* ── Sidebar ── */}
            <aside style={{
                width: sidebarW,
                minWidth: sidebarW,
                height: "100dvh",
                display: "flex",
                flexDirection: "column",
                background: "var(--surface)",
                borderRight: "1px solid var(--border)",
                transition: "width 0.2s ease",
                overflow: "hidden",
                position: "relative",
                zIndex: 20,
            }}>
                {/* Logo */}
                <div style={{
                    display: "flex", alignItems: "center",
                    gap: 10, padding: collapsed ? "18px 16px" : "18px 20px",
                    borderBottom: "1px solid var(--border)",
                    height: 64, minHeight: 64,
                }}>
                    <div style={{
                        width: 32, height: 32, flexShrink: 0, borderRadius: 10,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                    }}>
                        <BoltIcon style={{ width: 16, height: 16, color: "white" }} />
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: "hidden" }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.875rem", color: "var(--text)", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>
                                PageCraft
                            </p>
                            <p style={{ margin: 0, fontSize: "0.6rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                Admin
                            </p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                    {/* Dashboard link */}
                    <a
                        href="/dashboard"
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: collapsed ? "10px" : "10px 12px",
                            borderRadius: 10,
                            color: "var(--text-muted)",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            transition: "all 0.15s",
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)";
                            (e.currentTarget as HTMLElement).style.color = "#818cf8";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }}
                        title="Back to Dashboard"
                    >
                        <Squares2X2Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                        {!collapsed && <span>Dashboard</span>}
                    </a>

                    <div style={{ height: 1, background: "var(--border)", margin: "4px 4px 8px" }} />

                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <button
                                key={href}
                                onClick={() => router.push(href)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: collapsed ? "10px" : "10px 12px",
                                    borderRadius: 10, border: "none", cursor: "pointer",
                                    width: "100%", textAlign: "left",
                                    background: active ? "rgba(99,102,241,0.12)" : "transparent",
                                    color: active ? "#818cf8" : "var(--text-muted)",
                                    fontWeight: active ? 700 : 500,
                                    fontSize: "0.85rem",
                                    transition: "all 0.15s",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    position: "relative",
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)";
                                        (e.currentTarget as HTMLElement).style.color = "var(--text)";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                                    }
                                }}
                                title={label}
                            >
                                {active && (
                                    <div style={{
                                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                                        width: 3, borderRadius: "0 4px 4px 0",
                                        background: "#6366f1",
                                    }} />
                                )}
                                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                                {!collapsed && <span>{label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ borderTop: "1px solid var(--border)", padding: "12px 8px" }}>
                    {!collapsed && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                            padding: "8px 12px", borderRadius: 10,
                            background: "rgba(99,102,241,0.06)",
                        }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 800, fontSize: "0.8rem", color: "white",
                            }}>
                                {(user.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div style={{ overflow: "hidden", minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user.name || "Admin"}
                                </p>
                                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: collapsed ? "10px" : "10px 12px",
                            borderRadius: 10, border: "none", cursor: "pointer",
                            width: "100%", textAlign: "left",
                            background: "transparent",
                            color: "#f87171",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            transition: "all 0.15s",
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        title="Log out"
                    >
                        <ArrowRightOnRectangleIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
                        {!collapsed && <span>Log out</span>}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    style={{
                        position: "absolute", top: "50%", right: -12,
                        transform: "translateY(-50%)",
                        width: 24, height: 24, borderRadius: "50%",
                        background: "var(--surface)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", zIndex: 30,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#6366f1"; (e.currentTarget as HTMLElement).style.borderColor = "#6366f1"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                    <ChevronLeftIcon style={{
                        width: 12, height: 12,
                        color: "var(--text-muted)",
                        transform: collapsed ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                    }} />
                </button>
            </aside>

            {/* ── Main Content ── */}
            <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                {children}
            </main>
        </div>
    );
}
