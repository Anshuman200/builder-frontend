"use client";

import { useState, useEffect } from "react";
import {
    Bars3Icon,
    XMarkIcon,
    BoltIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, Dropdown, Button, MenuProps } from "antd";
import { Logo } from "@/components/shared/Logo";

interface HeaderProps {
    onLoginClick?: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        return `px-4 py-2 text-sm font-semibold rounded-xl transition-all no-underline ${isActive
            ? "text-white bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            : "text-[var(--text)]/50 hover:text-white hover:bg-[var(--text)]/10"
            }`;
    };

    const getMobileLinkClass = (path: string) => {
        const isActive = pathname === path;
        return `py-3 px-4 rounded-xl transition-all font-semibold no-underline ${isActive
            ? "text-white bg-indigo-600 shadow-md"
            : "text-[var(--text)]/70 hover:text-white hover:bg-[var(--text)]/10"
            }`;
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 inset-x-0 z-[100] flex justify-center p-4 md:p-6 transition-all duration-300">
            <header
                className={
                    "w-full max-w-5xl flex items-center justify-between gap-4 px-6 h-14 md:h-16 rounded-2xl md:rounded-full transition-all duration-500 ease-in-out border " +
                    (scrolled || mobileOpen
                        ? "bg-[var(--bg)]/80 backdrop-blur-2xl border-0 shadow-[var(--shadow-lg)]"
                        : "bg-transparent border-transparent")
                }
            >
                {/* Logo Section */}
                <Link
                    href={!user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home"}
                    className="flex items-center gap-3 no-underline shrink-0 group"
                >
                    <Logo src="/logoOnly.png" className="w-8 h-8 md:w-9 md:h-9" />
                </Link>

                {/* Centre Nav Links */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link href="/explore" className={getLinkClass("/explore")}>
                        Templates
                    </Link>
                    <Link href="/explore/media" className={getLinkClass("/explore/media")}>
                        Media
                    </Link>
                </nav>

                {/* Right Section: Auth */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Button type="text" onClick={onLoginClick} className="hidden sm:inline-flex !text-white hover:text-white">Log in</Button>
                    <Button
                        type="primary"
                        shape="round"
                        size="large"
                        href="/editor"
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            border: 'none',
                            fontWeight: 700,
                            boxShadow: "0 4px 20px -5px rgba(99,102,241,0.6)",
                        }}
                    >
                        Start Free
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <Dropdown
                        open={mobileOpen}
                        onOpenChange={setMobileOpen}
                        trigger={['click']}
                        popupRender={() => (
                            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-3xl p-4 flex flex-col gap-2 shadow-2xl mt-4 w-64 backdrop-blur-xl">
                                <Link href="/explore" className={getMobileLinkClass("/explore")}>📐 Templates</Link>
                                <Link href="/explore/media" className={getMobileLinkClass("/explore/media")}>🖼️ Media</Link>
                                <div className="h-px bg-[var(--text)]/5 my-1" />
                                {!user ? (
                                    <>
                                        <Button block onClick={() => { onLoginClick?.(); setMobileOpen(false); }} className="bg-[var(--text)]/5 text-[var(--text)] border-[var(--border)]">Log in</Button>
                                        <Button block type="primary" href="/editor" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>Start Free</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button block href={(user as any).role === 'admin' ? "/admin" : "/home"} className="bg-[var(--text)]/5 text-[var(--text)] border-[var(--border)]">Dashboard</Button>
                                        <Button block type="primary" onClick={() => logout()} danger>Log out</Button>
                                    </>
                                )}
                            </div>
                        )}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            icon={mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                            className="flex text-[var(--text)]/70 hover:text-[var(--text)] bg-[var(--text)]/5"
                        />
                    </Dropdown>
                </div>
            </header>
        </div>
    );
}