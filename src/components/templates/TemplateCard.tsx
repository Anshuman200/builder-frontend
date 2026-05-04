"use client";

import { motion } from "framer-motion";
import { ArrowRightIcon, ClockIcon, ArrowTopRightOnSquareIcon, EyeIcon, GlobeAltIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Template } from "@/types/templates";
import { getGradient } from "@/lib/utils/gradients";
import { cn } from "@/lib/utils";
import React from "react";

interface TemplateCardProps {
    template: Template & {
        isLocked?: boolean;
        status?: string;
        isPublic?: boolean;
        isLive?: boolean;
        domain?: string;
        updatedAt?: string;
    };
    onClick: () => void;
    onPreview?: () => void;
    index?: number;
    useMotion?: boolean;
    variant?: "public" | "admin" | "dashboard";
    actions?: React.ReactNode;
    subtitle?: string; // e.g., "By Community" or "2h ago"
    // Renaming (Dashboard)
    isRenaming?: boolean;
    renameValue?: string;
    setRenameValue?: (val: string) => void;
    onRenameSubmit?: () => void;
}

/**
 * A Universal Template Card component.
 * Centralizes UI for Public Gallery, Admin Panel, and User Dashboard.
 * Standardizes premium aesthetics and transitions.
 */
export function TemplateCard({
    template,
    onClick,
    onPreview,
    index = 0,
    useMotion = false,
    variant = "public",
    actions,
    subtitle,
    isRenaming,
    renameValue,
    setRenameValue,
    onRenameSubmit
}: TemplateCardProps) {
    const isLive = !!template.isLive;
    const isLocked = template.isLocked;
    const templateMeta = template as any;
    const thumbnail =
        template.thumbnail ||
        templateMeta.thumbnailUrl ||
        templateMeta.screenshot ||
        templateMeta.screenshotUrl ||
        (Array.isArray(templateMeta.thumbnails) ? templateMeta.thumbnails.find(Boolean) : undefined);
    const previewHref = `/preview/${template._id}`;
    const handlePreview = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (onPreview) {
            event.preventDefault();
            onPreview();
            return;
        }
        if (typeof window !== "undefined") {
            window.open(previewHref, "_blank", "noopener,noreferrer");
        }
    };

    const cardContent = (
        <>
            {/* Header / Preview Section */}
            <div
                className={cn(
                    "relative flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-[1.02]",
                    variant === "public" ? "h-[220px] sm:h-[280px]" : "h-32 sm:h-40",
                    isLocked ? "bg-linear-to-br from-zinc-800 to-zinc-900" : ""
                )}
                style={!isLocked && !thumbnail ? { background: getGradient(template.title) } : {}}
            >
                {/* Actual Page Screenshot */}
                {!isLocked && thumbnail ? (
                    <div className="absolute inset-0 bg-neutral-950">
                        <img
                            src={thumbnail}
                            alt={template.title}
                            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />
                        <div className="absolute left-3 right-3 top-3 flex h-6 items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-3 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-red-400/80" />
                            <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                            <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                            <span className="ml-2 h-1.5 flex-1 rounded-full bg-white/15" />
                        </div>
                        {/* Subtle gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-black/20 pointer-events-none" />
                    </div>
                ) : isLocked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/40 backdrop-blur-sm group-hover:bg-zinc-950/20 transition-all duration-700">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 opacity-30" />
                            <span className="text-3xl filter drop-shadow-lg">🔒</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">
                            Premium Asset
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 opacity-30" />
                        <div className={cn(
                            "font-black text-white/10 select-none z-10 pointer-events-none italic transition-transform duration-500",
                            variant === "public" ? "text-7xl sm:text-9xl group-hover:scale-110" : "text-5xl group-hover:scale-105",
                        )}>
                            {(template.title || "T")[0].toUpperCase()}
                        </div>
                    </>
                )}

                {/* Status Badges (Admin / Dashboard) */}
                <div className="absolute top-3 left-3 flex gap-1.5 z-20">
                    {variant !== "public" && (isLive) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-lg">
                            {isLocked ? "ENCRYPTED" : (
                                <>
                                    {isLive ? (
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    ) : null}
                                    {isLive ? "LIVE" : null}
                                </>
                            )}
                        </span>
                    )}
                    {variant !== "public" && template.isPublic !== undefined && (
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border backdrop-blur-md transition-all",
                            template.isPublic
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        )}>
                            {template.isPublic ? (
                                <>
                                    <GlobeAltIcon className="w-3 h-3" />
                                    PUBLIC
                                </>
                            ) : (
                                <>
                                    <LockClosedIcon className="w-3 h-3 text-zinc-500" />
                                    PRIVATE
                                </>
                            )}
                        </span>
                    )}
                    {variant === "public" && template.category && (
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                            {template.category}
                        </div>
                    )}
                </div>

            </div>

            {/* Content / Metadata Section */}
            <div className="p-4 flex flex-col flex-1 relative bg-zinc-950/90">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        {isRenaming && setRenameValue && onRenameSubmit ? (
                            <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={onRenameSubmit}
                                onKeyDown={(e) => e.key === "Enter" && onRenameSubmit()}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-black/40 border-2 border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                        ) : (
                            <div className="flex items-center gap-2 mb-1.5 min-w-0">
                                <h3 className={cn(
                                    "font-bold text-white leading-tight transition-colors group-hover:text-white truncate",
                                    variant === "public" ? "text-lg sm:text-2xl" : "text-sm sm:text-base"
                                )}>
                                    {template.title || "Untitled"}
                                </h3>
                                {isLive && (template as any).domain && (
                                    <a
                                        href={`https://${(template as any).domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-indigo-400 transition-all shrink-0"
                                        title="Visit live site"
                                    >
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        )}

                        {(variant === "public" || variant === "admin") && !isRenaming && (
                            <p className="text-[10px] sm:text-xs text-zinc-500 font-bold italic mb-3 opacity-80">
                                {subtitle || `By ${template.author?.name || "Community"}`}
                            </p>
                        )}

                        {variant !== "public" && !isRenaming && (
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 font-bold">
                                <ClockIcon className="w-3.5 h-3.5 opacity-60" />
                                <span>{subtitle || (template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : "Recently")}</span>
                            </div>
                        )}
                    </div>
                    {actions && <div className="z-20 shrink-0" onClick={(e) => e.stopPropagation()}>{actions}</div>}
                </div>

                {variant === "public" && (
                    <div className="mt-auto grid grid-cols-[0.9fr_1.1fr] gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handlePreview}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[10px] font-black uppercase tracking-widest text-white/65 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
                        >
                            <EyeIcon className="h-4 w-4" />
                            Preview
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onClick();
                            }}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_14px_28px_-18px_rgba(99,102,241,0.95)] transition-all hover:bg-indigo-400 hover:shadow-[0_18px_34px_-18px_rgba(99,102,241,1)]"
                        >
                            Use Template
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    const commonClasses = cn(
        "group bg-zinc-950 border border-white/8 rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-500 hover:translate-y-[-6px] hover:bg-zinc-900 hover:border-indigo-500/30 hover:shadow-[0_24px_50px_-22px_rgba(0,0,0,0.9)] transform-gpu will-change-transform",
        isLocked ? "opacity-70 blur-[0.5px]" : "opacity-100"
    );

    if (useMotion) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: (index % 12) * 0.05 }}
                onClick={!isLocked ? onClick : undefined}
                className={commonClasses}
            >
                {cardContent}
            </motion.div>
        );
    }

    return (
        <div onClick={!isLocked ? onClick : undefined} className={commonClasses}>
            {cardContent}
        </div>
    );
}
