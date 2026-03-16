"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/layout/PageTransition";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    return (
        <div className="h-screen overflow-hidden flex flex-col dark">
            <PageTransition pathname={pathname} className="h-full relative">
                {children}
            </PageTransition>
        </div>
    );
}
