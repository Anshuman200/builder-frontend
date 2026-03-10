"use client";

import { XMarkIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface Props {
    pageId: string;
    pageTitle?: string;
    onClose: () => void;
}

export function TemplatePreviewModal({ pageId, pageTitle, onClose }: Props) {
    const previewUrl = `/preview/${pageId}`;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="bg-(--surface) border border-(--border) rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-(--border) shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <GlobeAltIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-bold text-sm text-(--text) truncate">
                            {pageTitle || "Template Preview"}
                        </span>
                        <code className="text-xs text-(--text-muted) bg-(--bg) border border-(--border) px-2 py-0.5 rounded-md hidden sm:block">
                            {previewUrl}
                        </code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="text-indigo-400 border-indigo-400/30 hover:bg-indigo-400/10 h-8" asChild>
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open in tab</a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-(--text-muted)" onClick={onClose}>
                            <XMarkIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-2 bg-(--bg) border-b border-(--border) shrink-0">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/70" />
                        <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                    </div>
                    <div className="flex-1 bg-(--surface) border border-(--border) rounded-md px-3 py-1 text-xs text-(--text-muted) font-mono">
                        {typeof window !== "undefined" ? `${window.location.origin}${previewUrl}` : previewUrl}
                    </div>
                </div>

                {/* Iframe */}
                <div className="flex-1 overflow-hidden">
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-none bg-white"
                        title="Template Preview"
                    />
                </div>
            </div>
        </div>
    );
}
