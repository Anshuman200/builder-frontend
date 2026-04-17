"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Card,
    Button,
    Badge,
    Table,
    Space,
    Typography,
    Spin,
    Tag,
    message,
    Alert,
    Tooltip
} from "antd";
import {
    GlobalOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CopyOutlined,
    LinkOutlined,
    LockOutlined
} from '@ant-design/icons';
import { LockClosedIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useDomains, useVerifyDomain, useDeleteDomain, useUpdateDomainVisibility } from "@/lib/api/domainHooks";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteToast } from "@/context/DeleteToastContext";
import { Input } from "antd";

const { Title, Text } = Typography;

export default function DomainPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { data: domains = [], isLoading: loading } = useDomains(user?._id);
    const verifyMutation = useVerifyDomain();
    const deleteMutation = useDeleteDomain();
    const { startDelete } = useDeleteToast();
    const updateVisibilityMutation = useUpdateDomainVisibility();
    const [passwords, setPasswords] = useState<Record<string, string>>({});

    const handleUpdateVisibility = async (id: string, visibility: 'PUBLIC' | 'PRIVATE', password?: string) => {
        try {
            await updateVisibilityMutation.mutateAsync({ id, visibility, password });
            message.success(`Visibility updated to ${visibility.toLowerCase()}`);
        } catch (err: any) {
            message.error(err.message || "Failed to update visibility");
        }
    };

    const verifyDomain = async (id: string) => {
        await verifyMutation.mutateAsync(id);
    };

    const handleDeleteClick = (domain: any) => {
        if (!user?._id) return;

        const label = domain.isInternalProxy 
            ? (domain.workerUrl?.replace(/^https?:\/\//, '') || 'Proxy') 
            : domain.domain;

        startDelete(
            [{ id: domain._id, label }],
            async (item) => {
                await deleteMutation.mutateAsync({ id: item.id, userId: user._id });
            }
        );
    };

    const getStatusBadge = (domain: any) => {
        if (domain.isInternalProxy) {
            return <Badge status="processing" text="Live on Proxy" className="[&_.ant-badge-status-text]:text-blue-400! [&_.ant-badge-status-text]:font-bold! animate-pulse!" />;
        }
        if (domain.status === 'active') {
            return <Badge status="success" text="Active" />;
        }
        if (domain.ownershipVerified && !domain.trafficRoutingVerified) {
            return <Badge status="processing" text="Ownership Verified" className="text-blue-400 font-medium" />;
        }
        return <Badge status="warning" text="Pending" />;
    };

    const getDNSRecordsTable = (records: any[]) => {
        const columns = [
            {
                title: 'Hostname',
                dataIndex: 'hostname',
                key: 'hostname',
                render: (text: string) => <Text code copyable>{text}</Text>
            },
            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (text: string) => <Tag color="blue">{text}</Tag>
            },
            {
                title: 'Value',
                dataIndex: 'value',
                key: 'value',
                render: (text: string) => <Text code copyable style={{ wordBreak: 'break-all' }}>{text}</Text>
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={records}
                pagination={false}
                size="small"
                className="mt-2! [&_.ant-table]:bg-transparent! [&_.ant-table-cell]:bg-transparent! [&_.ant-table-cell]:text-white/70! [&_.ant-table-row:hover_td]:bg-white/5! [&_.ant-table-thead_th]:bg-white/5! [&_.ant-table-thead_th]:border-white/10! [&_.ant-table-cell]:border-white/10!"
                rowKey={(record, index) => `${record.hostname}-${index}`}
            />
        );
    };

    return (
        <div className="p-2 lg:p-8 w-full min-h-[80vh] bg-[#0a0a0a]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Title level={2} className="text-white! m-0! flex items-center gap-3">
                        <GlobalOutlined className="text-indigo-400" />
                        Domain Manager
                    </Title>
                    <Text className="text-white/50!">Manage custom domains for your projects</Text>
                </div>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push('/domains/connect')}
                    icon={<GlobalOutlined />}
                    className="h-12! px-8! text-base! font-bold! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all"
                >
                    Publish
                </Button>
            </div>

            {loading && domains.length === 0 ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Spin size="large" description="Loading domains..." />
                </div>
            ) : domains.length === 0 ? (
                <Card className="bg-[#141414]! border-white/10! rounded-3xl! p-12! text-center shadow-2xl!">
                    <div className="text-6xl mb-6 block">🌐</div>
                    <Title level={4} className="text-white!">No Project Published yet</Title>
                    <Text className="text-white/50! block">Publish your first project to get started</Text>
                    <div className="mt-8">
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => router.push('/domains/connect')}
                            className="h-12! px-10! text-base! font-bold! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all"
                        >
                            Publish
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {domains.map((d) => (
                        <Card
                            key={d._id}
                            className="bg-[#141414]! border-white/10! rounded-md! overflow-hidden hover:border-white/20! transition-all shadow-lg"
                            styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px' }, body: { padding: '24px' } }}
                            title={
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                                            {d.page?.thumbnail ? (
                                                <img src={d.page.thumbnail} alt={d.page.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                                                    <GlobalOutlined className="text-indigo-400 text-lg" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="text-white font-bold text-base whitespace-nowrap truncate max-w-[150px] md:max-w-none">
                                                    {d.isInternalProxy ? d.workerUrl?.replace(/^https?:\/\//, '') : d.domain}
                                                </div>
                                                <Tooltip title="Copy URL">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CopyOutlined />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(d.isInternalProxy ? d.workerUrl : d.domain);
                                                            message.success("Copied to clipboard");
                                                        }}
                                                        className="bg-white/5! border-white/10! text-white/60! hover:text-white! h-6! w-6! flex items-center justify-center rounded-md!"
                                                    />
                                                </Tooltip>
                                            </div>
                                            <div className="mt-0.5">{getStatusBadge(d)}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {d.isInternalProxy ? (
                                            <Button
                                                type="primary"
                                                icon={<GlobalOutlined />}
                                                onClick={() => router.push(`/domains/connect?pageId=${d.pageId}&skipDeploy=true`)}
                                                className="bg-linear-to-r! from-indigo-600! to-purple-600! border-0! hover:scale-[1.02]! transition-all"
                                            >
                                                <span className="hidden md:inline">Connect Custom Domain</span>
                                                <span className="md:hidden">Add Domain</span>
                                            </Button>
                                        ) : (
                                            <Tooltip title="Check Status">
                                                <Button
                                                    icon={<ReloadOutlined />}
                                                    loading={verifyMutation.isPending && verifyMutation.variables === d._id}
                                                    onClick={() => verifyDomain(d._id)}
                                                    className="bg-white/5! border-white/10! text-white! hover:bg-white/10!"
                                                >
                                                    <span className="hidden xl:inline">Check Status</span>
                                                </Button>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Delete Deployment">
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteClick(d)}
                                                className="bg-red-500/10! border-red-500/20! hover:bg-red-500/20!"
                                            >
                                                <span className="hidden xl:inline">Delete</span>
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            }
                        >
                            {/* Linked Project Info */}
                            <div className="mb-6 flex items-center justify-between p-3 bg-white/5! border border-white/10! rounded-md!">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Text className="text-white/40! text-[10px] font-medium uppercase tracking-wider">Project</Text>
                                            <Tag color="blue" className="text-[9px] py-0 px-1.5 border-blue-500/20! bg-blue-500/10! text-blue-400!">Live</Tag>
                                        </div>
                                        <div className="text-white font-semibold text-sm truncate">{d.page?.title || 'Unknown Project'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Tooltip title="Copy Target URL">
                                        <Button
                                            icon={<LinkOutlined />}
                                            size="small"
                                            onClick={() => {
                                                navigator.clipboard.writeText(d.targetUrl);
                                                message.success("Target URL copied");
                                            }}
                                            className="bg-white/5! border-white/10! text-white/60! hover:text-white!"
                                        />
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Visibility Settings */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <Text className="text-white/40! text-[10px] font-black uppercase tracking-[0.2em] mb-1">Access Control</Text>
                                        <Text className="text-white/20! text-[9px] font-medium lowercase">Control who can view your project</Text>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${d.visibility === 'PRIVATE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {d.visibility === 'PRIVATE' ? <LockClosedIcon className="w-3 h-3" /> : <GlobeAltIcon className="w-3 h-3" />}
                                        {d.visibility || 'PUBLIC'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleUpdateVisibility(d._id, 'PUBLIC')}
                                        disabled={updateVisibilityMutation.isPending}
                                        className={`flex items-center justify-center gap-3 h-12 rounded-2xl border transition-all duration-300 ${d.visibility !== 'PRIVATE' ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' : 'bg-white/2 border-white/5 text-white/30 hover:bg-white/5'}`}
                                    >
                                        <GlobeAltIcon className="w-4 h-4" />
                                        <span className="font-black text-[11px] uppercase tracking-widest">Public</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdateVisibility(d._id, 'PRIVATE')}
                                        disabled={updateVisibilityMutation.isPending}
                                        className={`flex items-center justify-center gap-3 h-12 rounded-2xl border transition-all duration-300 ${d.visibility === 'PRIVATE' ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' : 'bg-white/2 border-white/5 text-white/30 hover:bg-white/5'}`}
                                    >
                                        <LockClosedIcon className="w-4 h-4" />
                                        <span className="font-black text-[11px] uppercase tracking-widest">Private</span>
                                    </button>
                                </div>

                                {d.visibility === 'PRIVATE' && (
                                    <div className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Input.Password
                                            placeholder="Update password"
                                            value={passwords[d._id] || ''}
                                            onChange={e => setPasswords(prev => ({ ...prev, [d._id]: e.target.value }))}
                                            className="bg-white/5! border-white/10! text-white! rounded-xl h-11 flex-1 px-4!"
                                            prefix={<LockOutlined className="opacity-40" />}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => handleUpdateVisibility(d._id, 'PRIVATE', passwords[d._id])}
                                            loading={updateVisibilityMutation.isPending && updateVisibilityMutation.variables?.id === d._id}
                                            className="h-11! px-6! bg-indigo-600! border-0! rounded-xl! font-bold! text-[11px]! uppercase! tracking-widest!"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Verification Records */}
                            {d.status !== 'active' && d.requiresManualDns && (
                                <div className="mt-6 p-6 bg-amber-500/5! border border-amber-500/10! rounded-md!">
                                    <Title level={5} className="text-amber-400! mb-4! flex items-center gap-2">
                                        <span>⚠️</span> DNS Configuration Required
                                    </Title>
                                    <p className="text-white/60! text-sm! mb-6">Add these records to your DNS provider to activate your domain.</p>

                                    <div className="space-y-6">
                                        {/* Ownership Record */}
                                        {d.verification && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Text className="text-white font-semibold text-sm">1. Ownership Verification (TXT)</Text>
                                                    {d.ownershipVerified && (
                                                        <Tag color="success" icon={<CheckCircleOutlined />} className="ml-2! border-emerald-500/20! bg-emerald-500/10! text-emerald-400!">Verified</Tag>
                                                    )}
                                                </div>
                                                {!d.ownershipVerified && getDNSRecordsTable([{ hostname: d.verification.name, type: 'TXT', value: d.verification.value }])}
                                            </div>
                                        )}

                                        {/* SSL/DCV Record */}
                                        {d.dcvDelegation && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Text className="text-white font-semibold text-sm">2. SSL Certificate Issuance (CNAME)</Text>
                                                    {d.dcvVerified && <CheckCircleOutlined className="text-emerald-500" />}
                                                </div>
                                                {getDNSRecordsTable([{ hostname: d.dcvDelegation.name, type: 'CNAME', value: d.dcvDelegation.value }])}
                                            </div>
                                        )}

                                        {/* Routing Records */}
                                        {d.subdomainRecords && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Text className="text-white font-semibold text-sm">3. Traffic Routing (CNAME)</Text>
                                                    {d.trafficRoutingVerified && <CheckCircleOutlined className="text-emerald-500" />}
                                                </div>
                                                {getDNSRecordsTable(d.subdomainRecords)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {d.status === 'active' && !d.isInternalProxy && (
                                <div className="mt-4 p-4 bg-emerald-500/5! border border-emerald-500/10! rounded-md!">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircleOutlined className="text-lg" />
                                        <Text className="text-emerald-400! font-bold!">Domain is active and serving traffic</Text>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

        </div>
    );
}
