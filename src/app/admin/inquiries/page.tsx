"use client";

import { useState, useDeferredValue } from "react";
import {
    MagnifyingGlassIcon,
    TrashIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import { Table, Input, Button, Modal, Form, Tag } from "antd";
import {
    useAdminInquiries,
    useReplyInquiry,
    useDeleteInquiry
} from "@/lib/api/adminQuerties";
import { useToasts } from "@/hooks/useToasts";

export default function AdminInquiriesPage() {
    const { success, error: toastError } = useToasts();
    
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    
    const [replyingInquiry, setReplyingInquiry] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    const [form] = Form.useForm();

    const { data: inquiries = [], isLoading, isFetching } = useAdminInquiries();
    const replyMut = useReplyInquiry();
    const deleteMut = useDeleteInquiry();

    const filteredInquiries = inquiries.filter((i: any) => 
        i.name.toLowerCase().includes(deferredSearch.toLowerCase()) || 
        i.email.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        i.subject.toLowerCase().includes(deferredSearch.toLowerCase())
    );

    const handleOpenReply = (inquiry: any) => {
        setReplyingInquiry(inquiry);
        form.resetFields();
    };

    const handleCloseReply = () => {
        setReplyingInquiry(null);
        form.resetFields();
    };

    const handleSubmitReply = async (values: any) => {
        if (!replyingInquiry) return;
        try {
            await replyMut.mutateAsync({ id: replyingInquiry._id, replyMessage: values.replyMessage });
            success("Reply sent successfully");
            handleCloseReply();
        } catch (err: any) {
            toastError(err?.message || "Failed to send reply");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMut.mutateAsync(deleteTarget._id);
            success("Inquiry deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toastError(err?.message || "Failed to delete inquiry");
        }
    };

    const columns = [
        {
            title: "Sender",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-(--text) m-0 truncate max-w-[150px]">{name}</p>
                        <p className="text-xs text-(--text-muted) m-0 truncate max-w-[150px]">{record.email}</p>
                    </div>
                </div>
            )
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            render: (subject: string, record: any) => (
                <div className="max-w-[300px]">
                    <p className="text-sm font-bold text-(--text) m-0 truncate">{subject}</p>
                    <p className="text-xs text-(--text-muted) m-0 truncate" title={record.message}>{record.message}</p>
                </div>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag
                    color={status === 'REPLIED' ? "success" : "processing"}
                    style={{ borderRadius: 8, fontWeight: 700, border: "none", fontSize: "0.7rem", display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                    {status === 'REPLIED' ? <CheckCircleIcon className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />} 
                    {status}
                </Tag>
            )
        },
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => (
                <span className="text-xs text-(--text-muted)">
                    {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            )
        },
        {
            title: <div className="text-right">Actions</div>,
            key: "actions",
            align: "right" as const,
            render: (_: any, record: any) => (
                <div className="flex gap-1 justify-end">
                    {record.status === 'PENDING' ? (
                        <Button
                            type="text"
                            icon={<PaperAirplaneIcon className="w-4 h-4" />}
                            className="text-indigo-400 hover:bg-indigo-400/10 rounded-lg"
                            onClick={() => handleOpenReply(record)}
                            title="Reply"
                        />
                    ) : (
                        <Button
                            type="text"
                            icon={<EnvelopeIcon className="w-4 h-4" />}
                            className="text-(--text-muted) hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg"
                            onClick={() => handleOpenReply(record)}
                            title="View Reply"
                        />
                    )}
                    <Button
                        type="text"
                        danger
                        icon={<TrashIcon className="w-4 h-4" />}
                        className="hover:bg-red-400/10 rounded-lg"
                        onClick={() => setDeleteTarget(record)}
                        title="Delete Inquiry"
                    />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                        Contact Inquiries
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Manage messages submitted from the contact form.
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <Input
                    prefix={<MagnifyingGlassIcon style={{ width: 16, height: 16, color: "var(--text-muted)" }} />}
                    placeholder="Search by name, email or subject..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    size="large"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)", borderRadius: 12, maxWidth: 350 }}
                />
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                {isFetching && !isLoading && (
                    <div style={{ height: 3, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)", backgroundSize: "200%", animation: "shimmer 1.2s linear infinite", borderRadius: 2 }} />
                )}
                <Table
                    columns={columns}
                    dataSource={filteredInquiries}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{ pageSize: 20 }}
                    rowClassName={() => "hover:bg-white/[0.015] transition-colors"}
                />
            </div>

            {/* Reply Modal */}
            <Modal
                open={!!replyingInquiry}
                title={replyingInquiry?.status === 'REPLIED' ? "View Reply" : "Reply to Inquiry"}
                onCancel={handleCloseReply}
                width={700}
                style={{ top: 20 }}
                footer={replyingInquiry?.status === 'REPLIED' ? [
                    <Button key="close" onClick={handleCloseReply} style={{ borderRadius: 8 }}>
                        Close
                    </Button>
                ] : [
                    <Button key="cancel" onClick={handleCloseReply} style={{ borderRadius: 8 }}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                        loading={replyMut.isPending}
                        style={{ background: "#6366f1", borderRadius: 8 }}
                        icon={<PaperAirplaneIcon className="w-4 h-4" />}
                    >
                        Send Reply
                    </Button>,
                ]}
            >
                {replyingInquiry && (
                    <div className="mt-6 flex flex-col gap-6">
                        <div className="p-4 rounded-xl bg-(--bg) border border-(--border)">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-(--border)">
                                <div>
                                    <p className="text-sm font-bold text-(--text) m-0">{replyingInquiry.name}</p>
                                    <p className="text-xs text-(--text-muted) m-0">{replyingInquiry.email}</p>
                                </div>
                                <span className="text-xs text-(--text-muted)">
                                    {new Date(replyingInquiry.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-(--text) mb-2">{replyingInquiry.subject}</h4>
                            <p className="text-sm text-(--text-muted) whitespace-pre-wrap m-0">
                                {replyingInquiry.message}
                            </p>
                        </div>

                        {replyingInquiry.status === 'REPLIED' ? (
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                <h4 className="text-sm font-bold text-indigo-400 mb-2">Your Reply</h4>
                                <p className="text-sm text-(--text) whitespace-pre-wrap m-0">
                                    {replyingInquiry.replyMessage}
                                </p>
                            </div>
                        ) : (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmitReply}
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="replyMessage"
                                    label={<span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>Your Reply</span>}
                                    rules={[{ required: true, message: "Reply message is required" }]}
                                    extra="This message will be sent directly to the user's email."
                                >
                                    <Input.TextArea
                                        placeholder="Type your response here..."
                                        rows={6}
                                        style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)", padding: 12, resize: 'none' }}
                                    />
                                </Form.Item>
                            </Form>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            {deleteTarget && (
                <Modal
                    open
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <TrashIcon style={{ width: 18, height: 18, color: "#ef4444" }} />
                            <span>Delete Inquiry</span>
                        </div>
                    }
                    onOk={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    okText="Delete"
                    okButtonProps={{ danger: true, loading: deleteMut.isPending }}
                    centered
                >
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>
                        Are you sure you want to delete the inquiry from <strong style={{ color: "var(--text)" }}>"{deleteTarget.name}"</strong>?
                        This action cannot be undone.
                    </p>
                </Modal>
            )}

            <style>{`
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
        </div>
    );
}
