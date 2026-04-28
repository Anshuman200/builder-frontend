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
import { useAuth } from "@/hooks/useAuth";
import { Avatar, Dropdown, Button, MenuProps } from "antd";

interface HeaderProps {
    onLoginClick?: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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
                    className="group flex items-center gap-2 no-underline shrink-0"
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            boxShadow: "0 0 15px rgba(99,102,241,0.4)",
                        }}
                    >
                        <BoltIcon style={{ width: 16, height: 16, color: "white" }} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white] hidden sm:block">
                        PageCraft
                    </span>
                </Link>

                {/* Centre Nav Links */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link href="/explore" className="px-4 py-2 text-sm font-semibold text-[var(--text)]/50 hover:text-[var(--text)] hover:bg-[var(--text)]/5 rounded-xl transition-all no-underline">
                        Templates
                    </Link>
                    <Link href="/explore/media" className="px-4 py-2 text-sm font-semibold text-[var(--text)]/50 hover:text-[var(--text)] hover:bg-[var(--text)]/5 rounded-xl transition-all no-underline">
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
                                <Link href="/explore" className="py-3 px-4 rounded-xl text-[var(--text)]/70 hover:text-[var(--text)] hover:bg-[var(--text)]/5 transition-all no-underline">📐 Templates</Link>
                                <Link href="/explore/media" className="py-3 px-4 rounded-xl text-[var(--text)]/70 hover:text-[var(--text)] hover:bg-[var(--text)]/5 transition-all no-underline">🖼️ Media</Link>
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