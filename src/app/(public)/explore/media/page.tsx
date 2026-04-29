"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommonContainer } from "@/components/layout/CommonContainer";
import {
    MagnifyingGlassIcon,
    PhotoIcon,
    FilmIcon,
    ArrowDownTrayIcon,
    ListBulletIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useInfiniteMedia } from "@/hooks/useMedia";
import { s3Service } from "@/lib/services/s3-service";
import NextImage from "next/image";

// ─── Types ──────────────────────────────────────────────────────────────────

type TypeFilter = "all" | "image" | "video";
type LayoutMode = "masonry" | "grid";

// ─── Helper: force-trigger a file download ────────────────────────────────────

async function downloadAsset(url: string, filename: string) {
    try {
        const res = await fetch(url, { mode: "cors" });
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    } catch {
        // Fallback: open in new tab
        window.open(url, "_blank");
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicMediaPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [layout, setLayout] = useState<LayoutMode>("masonry");
    const [downloading, setDownloading] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteMedia({
        view: "public",
        limit: 30,
        search: debouncedSearch,
        type: typeFilter === "all" ? undefined : typeFilter,
    });

    const allMedia = data?.pages.flatMap((p) => p.media) ?? [];

    // Infinite scroll observer
    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el) return;
        const ob = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );
        ob.observe(el);
        return () => ob.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleDownload = useCallback(async (key: string, name: string) => {
        setDownloading(key);
        const url = s3Service.getPublicUrl(key) || "";
        await downloadAsset(url, name);
        setDownloading(null);
    }, []);

    const filterButtons: { label: string; value: TypeFilter; icon: React.ReactNode }[] = [
        { label: "All", value: "all", icon: <ListBulletIcon className="w-4 h-4" /> },
        { label: "Images", value: "image", icon: <PhotoIcon className="w-4 h-4" /> },
        { label: "Videos", value: "video", icon: <FilmIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="flex flex-col flex-1 bg-[url('/solarioBg.png')] object-center no-repeat bg-cover bg-fixed">
            {/* Black overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="relative z-10 pt-44 pb-16 px-6 text-center">
                <CommonContainer>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-8"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                            Free Community Assets
                        </motion.div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 bg-linear-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic">
                            Beautiful Media,<br /> Free to Use
                        </h1>

                        <p className="text-lg sm:text-xl text-zinc-400 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                            Browse thousands of high-quality images and videos shared by the community.
                            Download anything for free — no strings attached.
                        </p>

                        {/* ── Search + Filters ──────────────────────────── */}
                        <div className="bg-white/2 border border-white/8 backdrop-blur-3xl rounded-2xl p-2 sm:p-4 w-full shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Search bar */}
                            <div className="relative mb-4 flex items-center">
                                <MagnifyingGlassIcon className="absolute left-5 w-5 h-5 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search photos, videos, keywords..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white text-base outline-none transition-all focus:border-indigo-500/50 focus:bg-black/60 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Filter row */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex gap-2 flex-wrap">
                                    {filterButtons.map((f) => (
                                        <button
                                            key={f.value}
                                            onClick={() => setTypeFilter(f.value)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${typeFilter === f.value
                                                ? "bg-indigo-600 text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)]"
                                                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 border border-white/5"
                                                }`}
                                        >
                                            {f.icon}
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                {/* Layout toggle */}
                                <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                                    <button
                                        onClick={() => setLayout("masonry")}
                                        className={`p-2 rounded-lg transition-all ${layout === "masonry" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                        title="Masonry layout"
                                    >
                                        <Squares2X2Icon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setLayout("grid")}
                                        className={`p-2 rounded-lg transition-all ${layout === "grid" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                        title="Uniform grid"
                                    >
                                        <ListBulletIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </CommonContainer>
            </section>

            {/* ── Stats bar ────────────────────────────────────────────── */}
            {allMedia.length > 0 && (
                <CommonContainer className="relative z-10 mb-6 px-4">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        {allMedia.length}+ Free Assets Available
                    </div>
                </CommonContainer>
            )}

            {/* ── Gallery ──────────────────────────────────────────────── */}
            <CommonContainer className="relative z-10 pb-24">
                {status === "pending" && allMedia.length === 0 ? (
                    /* Skeleton */
                    <div className={layout === "masonry" ? "columns-2 md:columns-3 lg:columns-4 gap-4" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"}>
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="mb-4 rounded-2xl bg-white/5 animate-pulse"
                                style={{ height: layout === "masonry" ? `${180 + (i % 4) * 60}px` : "220px" }}
                            />
                        ))}
                    </div>
                ) : allMedia.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40"
                    >
                        <div className="text-7xl mb-6">📷</div>
                        <h3 className="text-2xl font-bold mb-4 text-white">No assets found</h3>
                        <p className="text-zinc-500 mb-10 max-w-sm mx-auto">
                            Try a different search term or filter.
                        </p>
                        <button
                            onClick={() => { setSearch(""); setTypeFilter("all"); }}
                            className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-colors text-white"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : layout === "masonry" ? (
                    /* ── Masonry ── */
                    <AnimatePresence initial={false}>
                        <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                            {allMedia.map((m, i) => {
                                const url = s3Service.getPublicUrl(m.key) || m.url || "";
                                const thumb = m.thumbnailKey ? s3Service.getPublicUrl(m.thumbnailKey) || url : url;
                                const isVideo = m.mimeType?.startsWith("video/");
                                const isDownloading = downloading === m.key;

                                return (
                                    <motion.div
                                        key={m._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.5 }}
                                        className="relative mb-4 rounded-2xl overflow-hidden group cursor-pointer break-inside-avoid"
                                        onMouseEnter={() => setHoveredId(m._id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-full">
                                            {isVideo ? (
                                                <video
                                                    src={url}
                                                    poster={thumb !== url ? thumb : undefined}
                                                    className="w-full rounded-2xl object-cover"
                                                    muted
                                                    loop
                                                    playsInline
                                                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                                    onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                                                />
                                            ) : (
                                                <NextImage
                                                    src={thumb || url}
                                                    alt={m.name}
                                                    width={600}
                                                    height={400}
                                                    className="w-full h-auto rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                                                    priority={i < 8}
                                                    placeholder={m.placeholder ? "blur" : undefined}
                                                    blurDataURL={m.placeholder}
                                                />
                                            )}
                                        </div>

                                        {/* Overlay */}
                                        <AnimatePresence>
                                            {hoveredId === m._id && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none"
                                                >
                                                    <div className="flex items-end justify-between pointer-events-auto">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <div className="text-[11px] font-black text-white truncate uppercase tracking-widest">{m.name}</div>
                                                            <div className="text-[9px] text-white/40 mt-0.5 uppercase font-bold">{(m.size / (1024 * 1024)).toFixed(1)} MB · {isVideo ? "Video" : "Image"}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownload(m.key, m.name)}
                                                            disabled={isDownloading}
                                                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white text-black hover:bg-indigo-400 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-60"
                                                            title="Download"
                                                        >
                                                            {isDownloading ? (
                                                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Video badge */}
                                        {isVideo && (
                                            <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur rounded-lg border border-white/10">
                                                Video
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                ) : (
                    /* ── Uniform Grid ── */
                    <AnimatePresence initial={false}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allMedia.map((m, i) => {
                                const url = s3Service.getPublicUrl(m.key) || m.url || "";
                                const thumb = m.thumbnailKey ? s3Service.getPublicUrl(m.thumbnailKey) || url : url;
                                const isVideo = m.mimeType?.startsWith("video/");
                                const isDownloading = downloading === m.key;

                                return (
                                    <motion.div
                                        key={m._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: Math.min(i * 0.03, 0.4) }}
                                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-white/5 border border-white/5"
                                        onMouseEnter={() => setHoveredId(m._id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <NextImage
                                            src={thumb || url}
                                            alt={m.name}
                                            fill
                                            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            priority={i < 8}
                                            placeholder={m.placeholder ? "blur" : undefined}
                                            blurDataURL={m.placeholder}
                                        />

                                        <AnimatePresence>
                                            {hoveredId === m._id && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 pointer-events-none"
                                                >
                                                    <div className="flex items-end justify-between pointer-events-auto">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <div className="text-[10px] font-black text-white truncate uppercase tracking-widest">{m.name}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownload(m.key, m.name)}
                                                            disabled={isDownloading}
                                                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white text-black hover:bg-indigo-400 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-60"
                                                        >
                                                            {isDownloading ? (
                                                                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {isVideo && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur rounded-lg border border-white/10">
                                                Video
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}

                {/* ── Infinite Scroll sentinel ── */}
                <div ref={loadMoreRef} className="py-16 flex justify-center">
                    {isFetchingNextPage ? (
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    ) : !hasNextPage && allMedia.length > 0 ? (
                        <div className="px-10 py-5 bg-white/5 border border-white/10 rounded-full text-zinc-500 text-sm font-bold tracking-widest uppercase backdrop-blur-xl">
                            End of Collection
                        </div>
                    ) : null}
                </div>
            </CommonContainer>
        </div>
    );
}
