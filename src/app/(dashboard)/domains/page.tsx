"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    Button,
    Badge,
    Table,
    Typography,
    Spin,
    Tag,
    Tooltip,
    Dropdown,
} from "antd";
import {
    GlobalOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CopyOutlined,
    LinkOutlined,
    LockOutlined,
    MoreOutlined,
    EyeOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
    LockClosedIcon,
    GlobeAltIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowUpRightIcon,
    SignalIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { useDomains, useVerifyDomain, useDeleteDomain, useUpdateDomainVisibility } from "@/lib/api/domainHooks";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToasts } from "@/hooks/useToasts";
import { Input } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const { Title, Text } = Typography;

export default function DomainPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { data: domains = [], isLoading: loading } = useDomains(user?._id);
    const [searchQuery, setSearchQuery] = useState("");

    const stats = useMemo(() => {
        const active = domains.filter(d => d.status === 'active' || d.isInternalProxy).length;
        const pending = domains.length - active;
        return { total: domains.length, active, pending };
    }, [domains]);

    const filteredDomains = useMemo(() => {
        return domains.filter(d =>
            (d.domain || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.workerUrl || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.page?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [domains, searchQuery]);

    return (
        <div className="p-4 lg:p-10 w-full min-h-screen text-white">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-6 mb-8 md:mb-12">
                    {/* Top Row: Title & Publish Button */}
                    <div className="flex items-center justify-between gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                    <GlobalOutlined className="text-indigo-400 text-base md:text-xl" />
                                </div>
                                <Title level={2} className="text-white! m-0! font-black tracking-tight text-lg md:text-2xl">
                                    Domain Manager
                                </Title>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => router.push('/domains/connect')}
                                icon={<ArrowUpRightIcon className="w-4 h-4" />}
                                className="h-10 md:h-12! px-4 md:px-8! text-xs md:text-sm! font-bold! bg-indigo-600! border-0! rounded-xl md:rounded-2xl! hover:bg-indigo-500! hover:scale-[1.02]! active:scale-[0.98]! transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2"
                            >
                                <span className="hidden xs:inline">Publish New</span>
                                <span className="xs:hidden">Publish</span>
                            </Button>
                        </motion.div>
                    </div>

                    {/* Bottom Row: Subtitle & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <Text className="text-white/40! text-[10px] md:text-sm font-medium leading-relaxed max-w-sm">
                            Scale your presence with custom domains and edge deployments
                        </Text>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative w-full md:w-64"
                        >
                            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10" />
                            <Input
                                placeholder="Search domains..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-white/5! border-white/10! text-white! pl-11! h-11 md:h-12! rounded-xl md:rounded-2xl! hover:border-white/20! focus:border-indigo-500/50! transition-all shadow-inner"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Stats Bar */}
                {domains.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 md:mb-12">
                        {[
                            { label: "Total Projects", value: stats.total, icon: <GlobalOutlined />, color: "text-indigo-400", bg: "bg-indigo-400/5" },
                            { label: "Live Domains", value: stats.active, icon: <SignalIcon className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-400/5" },
                            { label: "Pending Setup", value: stats.pending, icon: <ClockCircleOutlined />, color: "text-amber-400", bg: "bg-amber-400/5" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * i }}
                                className={cn(
                                    "bg-[#09090b] border border-white/5 p-3 md:p-6 rounded-md md:rounded-lg flex items-center justify-between group hover:border-white/10 transition-colors",
                                    i === 2 && "col-span-2 md:col-span-1" // Make the 3rd stat full width on sm grid
                                )}
                            >
                                <div>
                                    <Text className="text-white/30! text-[10px] font-black uppercase tracking-widest block mb-1">{stat.label}</Text>
                                    <Text className="text-white! text-2xl font-black block leading-none">{stat.value}</Text>
                                </div>
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    {stat.icon}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                {loading && domains.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                        <Spin size="large" className="[&_.ant-spin-dot-item]:bg-indigo-500!" />
                        <Text className="text-white/40 font-medium">Synchronizing deployments...</Text>
                    </div>
                ) : filteredDomains.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#09090b] border border-dashed border-white/10 rounded-[3rem] p-20 text-center shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/10 text-5xl">
                                🌐
                            </div>
                            <Title level={3} className="text-white! font-black mb-2">No Projects Published</Title>
                            <Text className="text-white/40! text-base block mb-10 max-w-md mx-auto">
                                Deploy your first project to Cloudflare edge and connect your custom domain in minutes.
                            </Text>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => router.push('/domains/connect')}
                                className="h-14! px-12! text-base! font-black! bg-white! text-black! border-0! rounded-2xl! hover:scale-105! transition-all shadow-xl"
                            >
                                Create First Deployment
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredDomains.map((d, index) => (
                                <DomainCard key={d._id} domain={d} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

function DomainCard({ domain: d, index }: { domain: any, index: number }) {
    const router = useRouter();
    const { user } = useAuth();
    const verifyMutation = useVerifyDomain();
    const deleteMutation = useDeleteDomain();
    const toast = useToasts();
    const updateVisibilityMutation = useUpdateDomainVisibility();
    const [localVisibility, setLocalVisibility] = useState(d.visibility);
    const [password, setPassword] = useState(d.password || "");

    useEffect(() => {
        setLocalVisibility(d.visibility);
        setPassword(d.password || "");
    }, [d.visibility, d.password]);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleUpdateVisibility = async (visibility: 'PUBLIC' | 'PRIVATE', providedPassword?: string) => {
        if (visibility === 'PUBLIC') {
            toast.promise(updateVisibilityMutation.mutateAsync({ id: d._id, visibility: 'PUBLIC' }), {
                loading: 'Updating visibility to Public...',
                success: () => {
                    setLocalVisibility('PUBLIC');
                    return 'Project is now Public';
                },
                error: (err: any) => err?.message || 'Failed to update visibility'
            });
            return;
        }

        // For PRIVATE: if we already have a password or it's already private on server
        if (providedPassword) {
            toast.promise(updateVisibilityMutation.mutateAsync({ id: d._id, visibility: 'PRIVATE', password: providedPassword }), {
                loading: 'Updating visibility to Private...',
                success: () => {
                    setLocalVisibility('PRIVATE');
                    return 'Project is now Private';
                },
                error: (err: any) => err?.message || 'Failed to update visibility'
            });
        } else {
            // Just show the input field locally if not already showing
            setLocalVisibility('PRIVATE');
            if (d.visibility !== 'PRIVATE') {
                toast.info("Please set a password to make this project private");
            }
        }
    };

    const handleDeleteClick = () => {
        if (!user?._id) return;
        const label = d.isInternalProxy ? (d.workerUrl?.replace(/^https?:\/\//, '') || 'Proxy') : d.domain;

        toast.promise(deleteMutation.mutateAsync({ id: d._id, userId: user._id }), {
            loading: `Deleting ${label}...`,
            success: `${label} removed successfully`,
            error: (err: any) => err?.message || `Failed to delete ${label}`
        });
    };

    const getStatusPill = () => {
        if (d.isInternalProxy) {
            return (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)] shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Live on Proxy
                </div>
            );
        }
        if (d.status === 'active') {
            return (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Pending Setup
            </div>
        );
    };

    const actionsMenu = (
        <div className="bg-[#141414] border border-white/10 p-1.5 rounded-2xl shadow-2xl min-w-[180px]">
            {d.isInternalProxy ? (
                <button
                    onClick={() => router.push(`/domains/connect?pageId=${d.pageId}&skipDeploy=true`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold"
                >
                    <GlobalOutlined /> Connect Custom Domain
                </button>
            ) : (
                <button
                    onClick={() => verifyMutation.mutate(d._id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold"
                >
                    <ReloadOutlined spin={verifyMutation.isPending} /> Check Status
                </button>
            )}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold"
            >
                <InfoCircleOutlined /> Technical Details
            </button>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
        >
            <div className="bg-[#09090b] border border-white/5 rounded-md overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-2xl group-hover:bg-[#0c0c0e]">
                <div className="p-2 md:p-4">
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Row 1: Project Info */}
                        <div className="flex items-center gap-4 md:gap-5 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border border-white/10 bg-black group-hover:border-white/20 transition-all duration-500">
                                    {d.page?.thumbnail ? (
                                        <img src={d.page.thumbnail} alt={d.page.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-500/5">
                                            <GlobalOutlined className="text-indigo-400/40 text-xl md:text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 p-0.5 md:p-1 bg-[#09090b] rounded-full">
                                    {d.visibility === 'PRIVATE' ? (
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                                            <LockClosedIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                            <GlobeAltIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-1.5 flex-wrap">
                                    <Text className="text-white! font-black text-lg md:text-xl tracking-tight truncate max-w-[200px] sm:max-w-none">
                                        {d.isInternalProxy ? d.workerUrl?.replace(/^https?:\/\//, '') : d.domain}
                                    </Text>
                                    {getStatusPill()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Text className="text-white/30! text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{d.page?.title || 'Unknown Project'}</Text>
                                    <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(d.isInternalProxy ? d.workerUrl : d.domain);
                                            toast.success("URL copied");
                                        }}
                                        className="text-indigo-400/50 cursor-pointer hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 shrink-0"
                                    >
                                        <CopyOutlined /> <span className="hidden sm:inline">Copy Link</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Visibility & Actions (Side-by-Side) */}
                        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-6">
                            {/* Visibility Controls */}
                            <div className="flex flex-col gap-2.5 shrink-0">
                                <Text className="text-white/20! text-[9px] font-black uppercase tracking-[0.2em]">Visibility</Text>
                                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => handleUpdateVisibility('PUBLIC')}
                                        className={cn(
                                            "px-3 md:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            localVisibility !== 'PRIVATE' ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/50"
                                        )}
                                    >
                                        Public
                                    </button>
                                    <button
                                        onClick={() => handleUpdateVisibility('PRIVATE')}
                                        className={cn(
                                            "px-3 md:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            localVisibility === 'PRIVATE' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-white/30 hover:text-white/50"
                                        )}
                                    >
                                        Private
                                    </button>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-3 shrink-0 self-end">
                                <Tooltip title="View Deployment">
                                    <Button
                                        type="text"
                                        size="large"
                                        icon={<EyeOutlined />}
                                        onClick={() => window.open(d.isInternalProxy ? d.workerUrl : `https://${d.domain}`, '_blank')}
                                        className="bg-white/5! border-white/10! text-white/60! hover:text-white! hover:bg-white/10! h-11 md:h-12! w-11 md:w-12! flex items-center justify-center rounded-xl md:rounded-2xl!"
                                    />
                                </Tooltip>
                                <Dropdown popupRender={() => actionsMenu} trigger={['click']} placement="bottomRight">
                                    <Button
                                        type="text"
                                        size="large"
                                        icon={<MoreOutlined />}
                                        className="bg-white/5! border-white/10! text-white/60! hover:text-white! hover:bg-white/10! h-11 md:h-12! w-11 md:w-12! flex items-center justify-center rounded-xl md:rounded-2xl!"
                                    />
                                </Dropdown>
                                <Tooltip title="Delete Deployment">
                                    <Button
                                        type="text"
                                        size="large"
                                        icon={<DeleteOutlined />}
                                        onClick={handleDeleteClick}
                                        className="bg-rose-500/5! border-rose-500/10! text-rose-400! hover:text-rose-300! hover:bg-rose-500/10! h-11 md:h-12! w-11 md:w-12! flex items-center justify-center rounded-xl md:rounded-2xl!"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Password Input for Private Visibility */}
                    <AnimatePresence>
                        {localVisibility === 'PRIVATE' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3 max-w-md">
                                    <Input.Password
                                        placeholder="Enter protection password..."
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="bg-white/5! border-white/10! text-white! rounded-xl! h-11! px-4! hover:border-white/20! focus:border-indigo-500/50!"
                                        prefix={<LockOutlined className="opacity-40 mr-2" />}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={() => handleUpdateVisibility('PRIVATE', password)}
                                        loading={updateVisibilityMutation.isPending && updateVisibilityMutation.variables?.id === d._id}
                                        disabled={!password.trim()}
                                        className="h-11! px-8! bg-indigo-600! border-0! rounded-xl! font-black! text-[10px]! uppercase! tracking-widest!"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Expandable Technical Details */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-white/5 bg-black/20"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <SettingOutlined className="text-amber-400 text-sm" />
                                        </div>
                                        <div>
                                            <Text className="text-white! font-bold text-sm block">Deployment Infrastructure</Text>
                                            <Text className="text-white/30! text-[10px] font-medium block">Technical details and DNS configuration</Text>
                                        </div>
                                    </div>
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => setIsExpanded(false)}
                                        icon={<ChevronUpIcon className="w-4 h-4" />}
                                        className="text-white/20 hover:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Proxy Info */}
                                    <div className="space-y-4">
                                        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl">
                                            <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest block mb-3">Edge Proxy</Text>
                                            <div className="flex items-center justify-between group/link">
                                                <Text code className="bg-transparent! border-0! p-0! text-indigo-300! font-mono text-[11px] truncate">{d.workerUrl}</Text>
                                                <button onClick={() => { navigator.clipboard.writeText(d.workerUrl); toast.success("URL copied"); }} className="opacity-0 group-hover/link:opacity-100 transition-opacity text-indigo-400"><CopyOutlined /></button>
                                            </div>
                                        </div>
                                        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl">
                                            <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest block mb-3">Target Origin</Text>
                                            <div className="flex items-center justify-between group/link">
                                                <Text code className="bg-transparent! border-0! p-0! text-white/50! font-mono text-[11px] truncate">{d.targetUrl}</Text>
                                                <button onClick={() => { navigator.clipboard.writeText(d.targetUrl); toast.success("Target URL copied"); }} className="opacity-0 group-hover/link:opacity-100 transition-opacity text-white/30"><CopyOutlined /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Summary */}
                                    <div className="bg-white/2 border border-white/5 p-5 rounded-2xl">
                                        <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest block mb-4">Verification Health</Text>
                                        <div className="space-y-3">
                                            <HealthItem label="Ownership" status={d.ownershipVerified} />
                                            <HealthItem label="SSL Certificate" status={d.dcvVerified} />
                                            <HealthItem label="Traffic Routing" status={d.trafficRoutingVerified} />
                                        </div>
                                    </div>
                                </div>

                                {/* DNS Tables */}
                                {d.status !== 'active' && d.requiresManualDns && (
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[2rem]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black">
                                                    <InfoCircleOutlined className="text-lg" />
                                                </div>
                                                <div>
                                                    <Text className="text-amber-400! font-black text-lg block">Action Required</Text>
                                                    <Text className="text-amber-400/60! text-xs font-medium block">Add these records to your DNS provider</Text>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                {d.verification && !d.ownershipVerified && (
                                                    <div>
                                                        <Text className="text-white/70 font-bold text-xs mb-3 block">1. Ownership Verification (TXT)</Text>
                                                        <DNSTable records={[{ hostname: d.verification.name, type: 'TXT', value: d.verification.value }]} />
                                                    </div>
                                                )}
                                                {d.dcvDelegation && !d.dcvVerified && (
                                                    <div>
                                                        <Text className="text-white/70 font-bold text-xs mb-3 block">2. SSL Certificate Issuance (CNAME)</Text>
                                                        <DNSTable records={[{ hostname: d.dcvDelegation.name, type: 'CNAME', value: d.dcvDelegation.value }]} />
                                                    </div>
                                                )}
                                                {d.subdomainRecords && !d.trafficRoutingVerified && (
                                                    <div>
                                                        <Text className="text-white/70 font-bold text-xs mb-3 block">3. Traffic Routing (CNAME)</Text>
                                                        <DNSTable records={d.subdomainRecords} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function HealthItem({ label, status }: { label: string, status: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <Text className="text-white/60 text-[11px] font-medium">{label}</Text>
            {status ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-white/20 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    Pending
                </div>
            )}
        </div>
    );
}

function DNSTable({ records }: { records: any[] }) {
    const columns = [
        {
            title: 'Hostname',
            dataIndex: 'hostname',
            key: 'hostname',
            render: (text: string) => <Text code copyable className="bg-white/5! border-0! text-indigo-300! font-mono text-[10px]">{text}</Text>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text: string) => <Tag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black text-[9px] uppercase px-1.5 py-0">{text}</Tag>
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text: string) => <Text code copyable className="bg-white/5! border-0! text-white/50! font-mono text-[10px] max-w-[200px] inline-block truncate">{text}</Text>
        },
    ];

    return (
        <div className="overflow-x-auto rounded-xl">
            <Table
                columns={columns}
                dataSource={records}
                pagination={false}
                size="small"
                className="[&_.ant-table]:bg-transparent! [&_.ant-table-cell]:bg-transparent! [&_.ant-table-cell]:text-white/70! [&_.ant-table-row:hover_td]:bg-white/5! [&_.ant-table-thead_th]:bg-white/5! [&_.ant-table-thead_th]:border-white/10! [&_.ant-table-cell]:border-white/10! [&_.ant-table-thead_th]:text-white/30! [&_.ant-table-thead_th]:text-[9px]! [&_.ant-table-thead_th]:uppercase! [&_.ant-table-thead_th]:tracking-widest! [&_.ant-table-thead_th]:font-black! min-w-[500px]"
                rowKey={(record, index) => `${record.hostname}-${index}`}
            />
        </div>
    );
}
