"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useInfinitePublicTemplates } from "@/lib/api/queries";
import { MagnifyingGlassIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { getGradient } from "@/lib/utils/gradients";
import { CATEGORIES, TEMPLATE_LIMIT, DEBOUNCE_WAIT } from "@/lib/constants/templates";
import { Template } from "@/types/templates";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CommonContainer } from "@/components/layout/CommonContainer";

/**
 * Premium Templates Gallery Page.
 * Inherits Header, Footer, and Backgrounds from Parent (public) Layout.
 */
export default function TemplatesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("All");

    // Debounce search input for performance
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_WAIT);
        return () => clearTimeout(t);
    }, [search]);

    // Construct API query parameters
    const queryParams: Record<string, string> = { limit: TEMPLATE_LIMIT.toString() };

    if (debouncedSearch) {
        queryParams.search = debouncedSearch;
    }
    if (category !== "All") {
        queryParams.category = category;
    }

    // Fetch templates with infinite scrolling
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfinitePublicTemplates(queryParams);

    const templates: Template[] = data?.pages.flatMap(page => page.templates) || [];

    // Intersection Observer trigger for loading more content
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <div className="flex flex-col flex-1 bg-[url('/solarioBg.png')] object-center no-repeat bg-cover bg-fixed">
            {/* Black overlay */}
            <div className="absolute inset-0 bg-black/60" />
            {/* Hero & Search Section */}
            <section className="relative z-10 pt-44 pb-20 px-6 text-center">
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
                            Curated Community Templates
                        </motion.div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 bg-linear-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic">
                            Infinite Creative <br /> Possibilities
                        </h1>

                        <p className="text-lg sm:text-xl text-zinc-400 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                            Professional-grade foundations for your next disruptive idea.
                            Built by the community, for the future.
                        </p>

                        {/* Search & Filters Container */}
                        <div className="bg-white/2 border border-white/8 backdrop-blur-3xl rounded-md p-2 sm:p-4 w-full shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Search Input */}
                            <div className="relative mb-4 flex items-center">
                                <MagnifyingGlassIcon className="absolute left-6 w-5 h-5 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search by title, category or keyword..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 bg-black/40 border border-white/10 rounded-md text-white text-lg outline-none transition-all duration-300 focus:border-indigo-500/50 focus:bg-black/60 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex overflow-x-auto pb-2 gap-3 justify-start sm:justify-center no-scrollbar">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${category === cat
                                            ? "bg-indigo-600 text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)]"
                                            : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 border border-white/5"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </CommonContainer>
            </section>

            {/* Content Results Grid */}
            <CommonContainer className="relative z-10">
                {status === "pending" && templates.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[450px] bg-white/5 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40"
                    >
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-2xl font-bold mb-4 text-white">No templates found</h3>
                        <p className="text-zinc-500 mb-10 max-w-sm mx-auto">
                            Broaden your horizons by trying a different search term or category.
                        </p>
                        <button
                            onClick={() => { setSearch(""); setCategory("All"); }}
                            className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg active:scale-95 text-white"
                        >
                            Reset All Filters
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                        <AnimatePresence initial={false}>
                            {templates.map((template, index) => (
                                <TemplateCard
                                    key={template._id}
                                    template={template}
                                    onClick={() => router.push(`/editor/${template._id}`)}
                                    index={index}
                                    useMotion={true}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Infinite Scroll Load Trigger */}
                <div ref={loadMoreRef} className="py-16 flex justify-center">
                    {isFetchingNextPage ? (
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    ) : !hasNextPage && templates.length > 0 ? (
                        <div className="px-10 py-5 bg-white/5 border border-white/10 rounded-full text-zinc-500 text-sm font-bold tracking-widest uppercase backdrop-blur-xl">
                            End of Collection
                        </div>
                    ) : null}
                </div>
            </CommonContainer>
        </div>
    );
}
