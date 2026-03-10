"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAdminUser } from "@/lib/api/queries";
import { ClockIcon, LockClosedIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d < 1) return "Today";
    if (d < 30) return `${d}d ago`;
    const m = Math.floor(d / 30);
    if (m < 12) return `${m}mo ago`;
    return `${Math.floor(m / 12)}y ago`;
}

const GRADIENTS = [
    "from-indigo-500 to-violet-600",
    "from-blue-500 to-cyan-400",
    "from-amber-500 to-rose-500",
    "from-emerald-500 to-blue-500",
];
const getGradient = (seed: string) => GRADIENTS[seed.length % GRADIENTS.length];

interface Props {
    userId: string;
    onClose: () => void;
}

export function UserProfileModal({ userId, onClose }: Props) {
    const { data, isLoading } = useAdminUser(userId);
    const [previewPageId, setPreviewPageId] = useState<string | null>(null);

    const user = data?.user;
    const pages = data?.pages ?? [];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="bg-(--surface) border border-(--border) rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) shrink-0">
                        <h2 className="text-base font-bold text-(--text)">User Profile</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-(--text-muted)" onClick={onClose}>
                            <XMarkIcon className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <Skeleton className="w-14 h-14 rounded-2xl bg-(--bg)" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <Skeleton className="h-5 w-40 bg-(--bg)" />
                                    <Skeleton className="h-4 w-56 bg-(--bg)" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-(--bg)" />)}
                            </div>
                        </div>
                    )}

                    {/* Not found */}
                    {!isLoading && !user && (
                        <div className="flex-1 flex items-center justify-center text-(--text-muted) text-sm">
                            User not found.
                        </div>
                    )}

                    {/* Content */}
                    {!isLoading && user && (
                        <>
                            {/* User intro */}
                            <div className="px-6 py-5 flex gap-4 items-start border-b border-(--border) shrink-0">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl shrink-0 bg-gradient-to-br flex items-center justify-center text-xl font-extrabold text-white shadow-lg",
                                    getGradient(user.name || user.email || "A")
                                )}>
                                    {(user.name || user.email || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-extrabold text-(--text)">
                                            {user.name || "—"}
                                        </h3>
                                        <Badge className={cn(
                                            "text-[10px] font-bold rounded-full px-2 py-0.5 border",
                                            user.isActive !== false
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {user.isActive !== false ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-(--text-muted) mt-0.5">{user.email}</p>

                                    <div className="flex gap-5 mt-3 flex-wrap">
                                        {[
                                            { label: "Region", value: user.region || "Unknown" },
                                            { label: "Joined", value: new Date(user.createdAt).toLocaleDateString() },
                                            { label: "Role", value: user.role || "user", capitalize: true },
                                            { label: "Templates", value: String(pages.length) },
                                        ].map(({ label, value, capitalize }) => (
                                            <div key={label}>
                                                <p className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest">{label}</p>
                                                <p className={cn("text-sm font-bold text-(--text) mt-0.5", capitalize && "capitalize")}>{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="info" className="flex flex-col flex-1 overflow-hidden">
                                <TabsList className="mx-6 mt-4 mb-0 rounded-xl bg-(--bg) border border-(--border) self-start shrink-0">
                                    <TabsTrigger value="info" className="text-xs rounded-lg">Info</TabsTrigger>
                                    <TabsTrigger value="templates" className="text-xs rounded-lg">
                                        Templates ({pages.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* Info tab */}
                                <TabsContent value="info" className="flex-1 overflow-auto px-6 pb-6">
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {[
                                            { label: "Full Name", value: user.name || "—" },
                                            { label: "Email", value: user.email },
                                            { label: "Region", value: user.region || "Unknown" },
                                            { label: "Role", value: user.role || "user", capitalize: true },
                                            { label: "Status", value: user.isActive !== false ? "Active" : "Inactive" },
                                            { label: "Verified", value: user.isVerified ? "Yes" : "No" },
                                            { label: "Joined", value: new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) },
                                            { label: "Last Updated", value: new Date(user.updatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) },
                                        ].map(({ label, value, capitalize }) => (
                                            <div key={label} className="bg-(--bg) rounded-xl border border-(--border) px-4 py-3">
                                                <p className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest">{label}</p>
                                                <p className={cn("text-sm font-bold text-(--text) mt-1 truncate", capitalize && "capitalize")}>{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* Templates tab */}
                                <TabsContent value="templates" className="flex-1 overflow-auto px-6 pb-6">
                                    {pages.length === 0 ? (
                                        <div className="flex items-center justify-center h-32 text-(--text-muted) text-sm">
                                            This user has no templates yet.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2.5 mt-4">
                                            {pages.map((page: any) => (
                                                <div
                                                    key={page._id}
                                                    onClick={() => setPreviewPageId(page._id)}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-(--bg) border border-(--border) cursor-pointer hover:border-indigo-500/50 transition-colors group"
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br flex items-center justify-center font-extrabold text-white text-base",
                                                        getGradient(page.title || "A")
                                                    )}>
                                                        {(page.title || "T")[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-(--text) truncate group-hover:text-indigo-400 transition-colors">
                                                            {page.title || "Untitled"}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-(--text-muted)">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {timeAgo(page.updatedAt)}
                                                            <span className={page.status === "PUBLISHED" ? "text-emerald-400" : "text-amber-400"}>
                                                                • {page.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-[10px] font-bold rounded-full border shrink-0",
                                                        page.isPublic
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                    )}>
                                                        {page.isPublic ? "PUBLIC" : "PRIVATE"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </div>

            {previewPageId && (
                <TemplatePreviewModal pageId={previewPageId} onClose={() => setPreviewPageId(null)} />
            )}
        </>
    );
}
