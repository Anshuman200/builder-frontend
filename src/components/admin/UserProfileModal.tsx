"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Modal, Button, Tabs, Tag, Skeleton, Divider, InputNumber, message } from "antd";
import { cn } from "@/lib/utils";
import { useAdminUser, useUpdateUserLimit } from "@/lib/api/queries";
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
    const updateLimitMut = useUpdateUserLimit();
    const [previewPageId, setPreviewPageId] = useState<string | null>(null);
    const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

    const user = data?.user;
    const pages = data?.pages ?? [];

    return (
        <>
            <Modal
                open
                onCancel={onClose}
                footer={null}
                closeIcon={null}
                width={672}
                centered
                styles={{
                    body: { padding: 0, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) shrink-0">
                        <h2 className="text-base font-bold text-(--text) m-0">User Profile</h2>
                        <Button type="text" icon={<XMarkIcon className="w-4 h-4" />} className="text-(--text-muted) hover:bg-(--bg)" onClick={onClose} />
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <Skeleton.Avatar active shape="square" size={56} style={{ borderRadius: 16 }} />
                                <div className="flex-1 pt-1">
                                    <Skeleton active paragraph={{ rows: 1 }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {[0, 1, 2, 3].map(i => <Skeleton.Button key={i} active size="large" style={{ height: 64, width: '100%', borderRadius: 12 }} />)}
                            </div>
                        </div>
                    )}

                    {/* Not found */}
                    {!isLoading && !user && (
                        <div className="flex-1 flex items-center justify-center p-8 text-(--text-muted) text-sm">
                            User not found.
                        </div>
                    )}

                    {/* Content */}
                    {!isLoading && user && (
                        <>
                            {/* User intro */}
                            <div className="px-6 py-5 flex gap-4 items-start border-b border-(--border) shrink-0">
                                { user.profilePic ? (
                                    <img src={user.profilePic} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-lg" />
                                ) : (
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl shrink-0 bg-linear-to-br flex items-center justify-center text-xl font-extrabold text-white shadow-lg",
                                        getGradient(user.name || user.email || "A")
                                    )}>
                                        {(user.name || user.email || "?")[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-extrabold text-(--text) m-0">
                                            {user.name || "—"}
                                        </h3>
                                        <Tag color={user.isActive !== false ? "success" : "error"} style={{ borderRadius: 10, fontWeight: 700, border: "none" }}>
                                            {user.isActive !== false ? "Active" : "Inactive"}
                                        </Tag>
                                    </div>
                                    <p className="text-sm text-(--text-muted) mt-0.5 mb-0">{user.email}</p>

                                    <div className="flex gap-5 mt-3 flex-wrap">
                                        {[
                                            { label: "Region", value: user.region || "Unknown" },
                                            { label: "Joined", value: new Date(user.createdAt).toLocaleDateString() },
                                            { label: "Role", value: user.role || "user", capitalize: true },
                                            { label: "Live Limit", value: user.publishLimit + " Sites" },
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
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <Tabs
                                    defaultActiveKey="info"
                                    className="flex-1"
                                    items={[
                                        {
                                            key: 'info',
                                            label: 'Info',
                                            children: (
                                                <div className="overflow-auto px-6 pb-6">
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
                                                                <p className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest m-0">{label}</p>
                                                                <p className={cn("text-sm font-bold text-(--text) mt-1 truncate mb-0", capitalize && "capitalize")}>{value}</p>
                                                            </div>
                                                        ))}

                                                        {/* Live Limit Update */}
                                                        <div className="bg-(--bg) rounded-xl border border-indigo-500/30 px-4 py-3 col-span-2">
                                                            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest m-0 mb-2">Manage Live Sites Limit</p>
                                                            <div className="flex items-center gap-3">
                                                                <InputNumber
                                                                    min={1}
                                                                    max={100}
                                                                    defaultValue={user.publishLimit || 5}
                                                                    onChange={(val) => {
                                                                        if (val) {
                                                                            updateLimitMut.mutate({ id: userId, publishLimit: val });
                                                                            message.success("Limit updated");
                                                                        }
                                                                    }}
                                                                    className="flex-1 bg-black/20 border-white/10 text-white rounded-lg"
                                                                />
                                                                <span className="text-xs text-white/40 font-bold uppercase tracking-tighter">Sites Max</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'templates',
                                            label: `Templates (${pages.length})`,
                                            children: (
                                                <div className="overflow-y-auto px-6 pb-6">
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
                                                                         "w-10 h-10 rounded-xl shrink-0 bg-linear-to-br flex items-center justify-center font-extrabold text-white text-base",
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
                                                                            <span className={page.isLive ? "text-emerald-400" : page.isPublic ? "text-indigo-400" : "text-amber-400"}>
                                                                                • {page.isLive ? "LIVE" : page.isPublic ? "PUBLIC" : "DRAFT"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Tag color={page.isLive ? "success" : page.isPublic ? "processing" : "default"} style={{ borderRadius: 10, fontWeight: 700, border: "none", alignSelf: "center", margin: 0 }}>
                                                                        {page.isLive ? "LIVE" : page.isPublic ? "PUBLIC" : "PRIVATE"}
                                                                    </Tag>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }
                                    ]}
                                    tabBarStyle={{ padding: '0 24px', margin: 0 }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {previewPageId && (
                <TemplatePreviewModal pageId={previewPageId} onClose={() => setPreviewPageId(null)} />
            )}
        </>
    );
}
