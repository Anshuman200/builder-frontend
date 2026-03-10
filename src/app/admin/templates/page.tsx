"use client";

import { useState, useDeferredValue, useEffect } from "react";
import { MagnifyingGlassIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAdminTemplates } from "@/lib/api/queries";
import { TemplatePreviewModal } from "@/components/admin/TemplatePreviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToasts } from "@/hooks/useToasts";

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const GRADIENTS = [
    "from-indigo-500 to-violet-600",
    "from-blue-500 to-cyan-400",
    "from-amber-500 to-rose-500",
    "from-emerald-500 to-blue-500",
];
const getGradient = (seed: string) => GRADIENTS[seed.length % GRADIENTS.length];

type Visibility = "all" | "public" | "private";

const VISIBILITY_TABS: { key: Visibility; label: string }[] = [
    { key: "all", label: "All" },
    { key: "public", label: "Public" },
    { key: "private", label: "Private" },
];

export default function AdminTemplatesPage() {
    const { error: toastError } = useToasts();
    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState<Visibility>("all");
    const [sortBy, setSortBy] = useState("updatedAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [preview, setPreview] = useState<{ id: string; title: string } | null>(null);

    const deferredSearch = useDeferredValue(search);

    const params: Record<string, string> = { visibility, sortBy, order, page: String(page), limit: "24" };
    if (deferredSearch) params.search = deferredSearch;

    const { data, isLoading, isError, error: queryError } = useAdminTemplates(params);
    const templates = data?.templates ?? [];
    const totalPages = data?.pages ?? 1;

    useEffect(() => {
        if (isError) toastError((queryError as Error)?.message ?? "Failed to load templates");
    }, [isError]);

    return (
        <div className="p-8 max-w-7xl w-full">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-(--text) tracking-tight">Templates</h1>
                <p className="text-sm text-(--text-muted) mt-1">
                    {data ? `${data.total} total templates` : "Loading..."}
                </p>
            </div>

            {/* Filters row */}
            <div className="flex gap-3 mb-6 flex-wrap items-center">
                {/* Visibility tabs */}
                <div className="flex bg-(--bg) border border-(--border) rounded-xl p-1 gap-0.5">
                    {VISIBILITY_TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => { setVisibility(key); setPage(1); }}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                                visibility === key
                                    ? "bg-(--surface) text-(--text) shadow-sm"
                                    : "text-(--text-muted) hover:text-(--text)"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-52">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                    <Input
                        placeholder="Search by title..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 bg-(--surface) border-(--border) text-(--text) placeholder:text-(--text-muted) h-10"
                    />
                </div>

                {/* Sort */}
                <Select
                    value={`${sortBy}:${order}`}
                    onValueChange={value => {
                        const [f, o] = value.split(":");
                        setSortBy(f); setOrder(o as "asc" | "desc"); setPage(1);
                    }}
                    
                >
                    <SelectTrigger className="w-[180px] bg-(--surface) border-(--border)">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="updatedAt:desc">Newest first</SelectItem>
                        <SelectItem value="updatedAt:asc">Oldest first</SelectItem>
                        <SelectItem value="title:asc">Title A→Z</SelectItem>
                        <SelectItem value="title:desc">Title Z→A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Skeleton loading */}
            {isLoading && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-(--border)">
                            <Skeleton className="h-32 w-full rounded-none bg-(--surface)" />
                            <div className="p-3 space-y-2 bg-(--bg)">
                                <Skeleton className="h-4 w-3/4 bg-(--surface)" />
                                <Skeleton className="h-3 w-1/2 bg-(--surface)" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty */}
            {!isLoading && templates.length === 0 && (
                <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-(--border) text-(--text-muted) text-sm">
                    No templates found matching your filters.
                </div>
            )}

            {/* Grid */}
            {!isLoading && templates.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                    {templates.map((tpl: any) => (
                        <Card
                            key={tpl._id}
                            onClick={() => setPreview({ id: tpl._id, title: tpl.title })}
                            className="bg-(--surface) border-(--border) overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-indigo-500/40 group p-0 gap-0"
                        >
                            {/* Thumbnail */}
                            <div className={cn(
                                "h-32 bg-gradient-to-br flex items-center justify-center relative",
                                getGradient(tpl.title || "A")
                            )}>
                                <span className="text-5xl font-black text-white/20 group-hover:scale-110 transition-transform duration-500">
                                    {(tpl.title || "T")[0].toUpperCase()}
                                </span>
                                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/10">
                                        {tpl.status === "PUBLISHED" ? "LIVE" : "DRAFT"}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full text-white border border-white/10",
                                        tpl.isPublic ? "bg-emerald-500/70" : "bg-indigo-500/70"
                                    )}>
                                        {tpl.isPublic ? "PUBLIC" : "PRIVATE"}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <CardContent className="p-3">
                                <p className="font-bold text-sm text-(--text) truncate group-hover:text-indigo-400 transition-colors">
                                    {tpl.title || "Untitled"}
                                </p>
                                {tpl.author && (
                                    <p className="text-xs text-(--text-muted) mt-0.5 truncate">
                                        By {tpl.author.name || tpl.author.email || "Unknown"}
                                    </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-(--text-muted)">
                                    <ClockIcon className="w-3 h-3" />
                                    {timeAgo(tpl.updatedAt)}
                                    {tpl.category && tpl.category !== "Other" && (
                                        <>
                                            <span className="opacity-40">·</span>
                                            <span className="text-indigo-400 font-semibold">{tpl.category}</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-(--border) bg-(--surface) text-(--text) hover:bg-(--bg)"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                        .map(p => (
                            <Button
                                key={p}
                                size="icon"
                                className={cn(
                                    "h-9 w-9 text-sm",
                                    p === page
                                        ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                                        : "bg-(--surface) border border-(--border) text-(--text-muted) hover:bg-(--bg)"
                                )}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-(--border) bg-(--surface) text-(--text) hover:bg-(--bg)"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Preview modal */}
            {preview && (
                <TemplatePreviewModal
                    pageId={preview.id}
                    pageTitle={preview.title}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    );
}
