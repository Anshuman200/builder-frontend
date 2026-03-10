"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    UsersIcon,
    DocumentDuplicateIcon,
    BoltIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
    { href: "/admin/users", label: "Users", Icon: UsersIcon },
    { href: "/admin/templates", label: "Templates", Icon: DocumentDuplicateIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && user && (user as any).role !== "admin") {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    if (isLoading || !user) return null;
    if ((user as any).role !== "admin") return null;

    return (
        <div className="flex h-dvh bg-(--bg) overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-60 shrink-0 flex flex-col bg-(--surface) border-r border-(--border) px-3 py-5 gap-1">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-2 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BoltIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-extrabold text-sm text-(--text) tracking-tight">PageCraft</p>
                        <p className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">Admin Panel</p>
                    </div>
                </div>

                <Separator className="bg-(--border) mb-1" />

                {/* Nav */}
                <nav className="flex-1 flex flex-col gap-0.5 mt-1">
                    {navItems.map(({ href, label, Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} className="no-underline">
                                <div className={cn(
                                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border",
                                    active
                                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        : "text-(--text-muted) hover:bg-(--bg) hover:text-(--text) border-transparent"
                                )}>
                                    <Icon className="w-4.5 h-4.5 shrink-0" />
                                    {label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-(--border) pt-3 mt-1 space-y-2">
                    <div className="px-3">
                        <p className="text-sm font-semibold text-(--text) truncate">{user.name || "Admin"}</p>
                        <p className="text-xs text-(--text-muted) truncate">{user.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-400 hover:text-red-400 hover:bg-red-400/10 h-9 px-3"
                        onClick={handleLogout}
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-auto flex flex-col">
                {children}
            </main>
        </div>
    );
}
