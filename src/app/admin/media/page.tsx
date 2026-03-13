"use client";

import { CommonContainer } from "@/components/layout/CommonContainer";
import MediaLibraryView from "@/components/media/MediaLibraryView";

export default function AdminMediaPage() {
    return (
        <CommonContainer className="min-h-screen py-8">
            <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    Media Assets
                </h1>
                <p className="text-white/50 text-sm font-medium tracking-wide">
                    Manage your library and public assets in one high-performance interface.
                </p>
            </div>

            <div className="bg-neutral-950/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-2xl">
                <MediaLibraryView />
            </div>
        </CommonContainer>
    );
}
