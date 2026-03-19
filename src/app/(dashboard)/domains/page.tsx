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
    LinkOutlined
} from '@ant-design/icons';
import { domainApi } from "@/lib/api/domain";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DeleteConfirmModal from "@/components/domains/DeleteConfirmModal";
// Removed plain CSS import in favor of Tailwind

const { Title, Text } = Typography;

export default function DomainPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [domains, setDomains] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [domainToDelete, setDomainToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const loadDomains = useCallback(async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            const data = await domainApi.list(user._id);
            setDomains(data);
        } catch (err) {
            console.error(err);
            message.error("Failed to load domains");
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        loadDomains();
    }, [loadDomains]);

    const verifyDomain = async (id: string) => {
        setVerifyingId(id);
        try {
            await domainApi.verify(id);
            await loadDomains();
            message.success("Status updated");
        } catch (err: any) {
            message.error(err.message || "Verification failed");
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDeleteClick = (domain: any) => {
        setDomainToDelete(domain);
        setDeleteModalOpen(true);
        setDeleteError("");
    };

    const handleConfirmDelete = async () => {
        if (!domainToDelete || !user?._id) return;
        setDeleting(true);
        setDeleteError("");

        try {
            await domainApi.delete(domainToDelete._id, user._id);
            await loadDomains();
            setDeleteModalOpen(false);
            setDomainToDelete(null);
            message.success("Domain deleted");
        } catch (err: any) {
            setDeleteError(err.message || "Failed to delete domain");
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (domain: any) => {
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
        <div className="p-4 w-full min-h-screen bg-[#0a0a0a]">
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
                    Add Custom Domain
                </Button>
            </div>

            {loading && domains.length === 0 ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Spin size="large" description="Loading domains..." />
                </div>
            ) : domains.length === 0 ? (
                <Card className="bg-[#141414]! border-white/10! rounded-3xl! p-12! text-center shadow-2xl!">
                    <div className="text-6xl mb-6 block">🌐</div>
                    <Title level={4} className="text-white!">No domains yet</Title>
                    <Text className="text-white/50! block">Add your first custom domain to get started</Text>
                    <div className="mt-8">
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => router.push('/domains/connect')}
                            className="h-12! px-10! text-base! font-bold! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all"
                        >
                            Add Custom Domain
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
                                                <div className="text-white font-bold text-base whitespace-nowrap">{d.domain}</div>
                                                <Tooltip title="Copy Domain">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CopyOutlined />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(d.domain);
                                                            message.success("Domain copied");
                                                        }}
                                                        className="bg-white/5! border-white/10! text-white/60! hover:text-white! h-6! w-6! flex items-center justify-center rounded-md!"
                                                    />
                                                </Tooltip>
                                            </div>
                                            <div className="mt-0.5">{getStatusBadge(d)}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Tooltip title="Check Status">
                                            <Button
                                                icon={<ReloadOutlined />}
                                                loading={verifyingId === d._id}
                                                onClick={() => verifyDomain(d._id)}
                                                className="bg-white/5! border-white/10! text-white! hover:bg-white/10!"
                                            >
                                                <span className="hidden xl:inline">Check Status</span>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete Domain">
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

                            {d.status === 'active' && (
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

            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                domainName={domainToDelete?.domain || ""}
                isDeleting={deleting}
                error={deleteError}
            />
        </div>
    );
}
