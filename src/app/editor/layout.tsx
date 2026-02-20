import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Editor | PageCraft",
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen overflow-hidden flex flex-col dark">
            {children}
        </div>
    );
}
