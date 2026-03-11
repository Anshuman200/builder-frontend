"use client";

import { useState, useDeferredValue, useEffect } from "react";
import { MagnifyingGlassIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAdminTemplates } from "@/lib/api/queries";
import { TemplatePreviewModal } from "@/components/admin/TemplatePreviewModal";
import { Button, Input, Select, Skeleton } from "antd";
import { cn } from "@/lib/utils";
import { useToasts } from "@/hooks/useToasts";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";

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
        <CommonContainer className="py-8">
            {/* Header */}
            <div className="mb-7">
                <h1 className="m-0 text-2xl font-extrabold text-(--text) tracking-tight">
                    Templates
                </h1>
                <p className="mt-1 text-sm text-(--text-muted)">
                    {data ? `${data.total} total templates` : "Loading..."}
                </p>
            </div>

            {/* Filters row */}
            <div className="flex gap-3 mb-6 flex-wrap items-center">
                {/* Visibility tabs */}
                <div className="flex bg-(--surface) border border-(--border) rounded-xl p-1 gap-0.5">
                    {VISIBILITY_TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => { setVisibility(key); setPage(1); }}
                            className={cn(
                                "px-4 py-1.5 rounded-lg border-none cursor-pointer font-semibold text-xs transition-all",
                                visibility === key
                                    ? "bg-linear-to-br from-indigo-500 to-indigo-600 text-white shadow-lg"
                                    : "bg-transparent text-(--text-muted) hover:text-(--text)"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex-1 min-w-[220px]">
                    <Input
                        prefix={<MagnifyingGlassIcon className="w-4 h-4 text-(--text-muted)" />}
                        placeholder="Search by title..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        size="large"
                        className="bg-(--surface) border-(--border) text-(--text) rounded-xl"
                    />
                </div>

                {/* Sort */}
                <Select
                    value={`${sortBy}:${order}`}
                    onChange={value => {
                        const [f, o] = value.split(":");
                        setSortBy(f); setOrder(o as "asc" | "desc"); setPage(1);
                    }}
                    size="large"
                    className="w-[180px]"
                    popupMatchSelectWidth={false}
                    options={[
                        { label: "Newest first", value: "updatedAt:desc" },
                        { label: "Oldest first", value: "updatedAt:asc" },
                        { label: "Title A→Z", value: "title:asc" },
                        { label: "Title Z→A", value: "title:desc" },
                    ]}
                />
            </div>

            {/* Skeleton loading */}
            {isLoading && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-64 bg-(--surface) border border-(--border) rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && templates.length === 0 && (
                <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-(--border) text-(--text-muted) text-sm">
                    No templates found matching your filters.
                </div>
            )}

            {/* Grid */}
            {!isLoading && templates.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                    {templates.map((tpl: any) => (
                        <TemplateCard
                            key={tpl._id}
                            template={tpl}
                            onClick={() => setPreview({ id: tpl._id, title: tpl.title })}
                            variant="admin"
                            subtitle={timeAgo(tpl.updatedAt)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
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
                                type={p === page ? "primary" : "default"}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    <Button
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
        </CommonContainer>
    );
}
