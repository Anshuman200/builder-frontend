"use client";

import { Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { pagesApi } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface PublishButtonProps {
    pageId: string;
}

export function PublishButton({ pageId }: PublishButtonProps) {
    const { page, setPage } = useEditorStore();
    const [publishing, setPublishing] = useState(false);
    const isPublished = page?.status === "PUBLISHED";

    async function handlePublish() {
        if (!page || publishing) return;
        setPublishing(true);
        try {
            if (isPublished) {
                const res = await pagesApi.unpublish(pageId);
                setPage({ ...page, status: "DRAFT", ...res.data });
            } else {
                const res = await pagesApi.publish(pageId);
                setPage({ ...page, status: "PUBLISHED", ...res.data });
            }
        } catch {
            // silent fail — toast can be added later
        } finally {
            setPublishing(false);
        }
    }

    return (
        <button
            onClick={handlePublish}
            disabled={publishing}
            className={cn(
                "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-bold transition-all",
                isPublished
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                    : "text-white border-0",
                publishing && "opacity-60 cursor-not-allowed"
            )}
            style={
                !isPublished
                    ? {
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          boxShadow: "0 0 14px rgba(99,102,241,0.35)",
                      }
                    : undefined
            }
        >
            {publishing ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <Globe size={12} />
            )}
            {isPublished ? "Live" : "Publish"}
        </button>
    );
}
