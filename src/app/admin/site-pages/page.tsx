"use client";

import { useState, useDeferredValue, useRef, useEffect } from "react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";

interface SitePageRecord {
    _id: string;
    title: string;
    slug: string;
    content?: string;
    isActive: boolean;
    updatedAt?: string;
    createdAt?: string;
}
import { Table, Input, Button, Modal, Form, Switch } from "antd";
import {
    useAdminSitePages,
    useCreateSitePage,
    useUpdateSitePage,
    useDeleteSitePage
} from "@/lib/api/adminQuerties";
import { useToasts } from "@/hooks/useToasts";
import dynamic from 'next/dynamic';
import { CommonContainer } from "@/components/layout/CommonContainer";

// Import Jodit safely for client-side only
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function AdminSitePagesPage() {
    const { success, error: toastError } = useToasts();

    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<SitePageRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SitePageRecord | null>(null);
    const [editorContent, setEditorContent] = useState("");

    // We update the content dynamically instead of via antd form field to ensure jodit gets the value immediately
    const editorRef = useRef(null);

    // Fix for Ant Design Modal focus trapping conflicting with Jodit popups (Ex: Image/Video URL inputs)
    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.closest && (target.closest('.jodit-dialog__box') || target.closest('.jodit-popup'))) {
                e.stopPropagation();
            }
        };
        // Use capture phase to intercept before Antd Modal focus trap resets it
        document.addEventListener("focusin", handleFocus, true);
        return () => document.removeEventListener("focusin", handleFocus, true);
    }, []);

    const [form] = Form.useForm();

    const { data: pages = [], isLoading, isFetching } = useAdminSitePages();
    const createMut = useCreateSitePage();
    const updateMut = useUpdateSitePage();
    const deleteMut = useDeleteSitePage();

    const filteredPages = pages.filter((p: SitePageRecord) =>
        p.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(deferredSearch.toLowerCase())
    );

    const handleOpenModal = (page?: SitePageRecord) => {
        setEditingPage(page || null);
        if (page) {
            form.setFieldsValue({
                title: page.title,
                slug: page.slug,
                isActive: page.isActive
            });
            setEditorContent(page.content || "");
        } else {
            form.resetFields();
            form.setFieldsValue({ isActive: true });
            setEditorContent("");
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPage(null);
        form.resetFields();
    };

    const handleSubmit = async (values: { title: string; slug: string; isActive: boolean }) => {
        try {
            const payload = { ...values, content: editorContent };
            if (editingPage) {
                await updateMut.mutateAsync({ id: editingPage._id, ...payload });
                success("Page updated successfully");
            } else {
                await createMut.mutateAsync(payload);
                success("Page created successfully");
            }
            handleCloseModal();
        } catch (error) {
            const err = error as Error;
            toastError(err?.message || "Failed to save page");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMut.mutateAsync(deleteTarget._id);
            success("Page deleted successfully");
            setDeleteTarget(null);
        } catch (error) {
            const err = error as Error;
            toastError(err?.message || "Failed to delete page");
        }
    };
    const handleTogglePublish = async (record: SitePageRecord, checked: boolean) => {
        try {
            // We only send the ID and the new isActive status to avoid sending unmodified content back
            await updateMut.mutateAsync({ id: record._id, isActive: checked });
            success(`Page ${checked ? 'published' : 'unpublished'} successfully`);
        } catch (error) {
            const err = error as Error;
            toastError(err?.message || "Failed to update page status");
        }
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            width: 300,
            render: (title: string, record: SitePageRecord) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <DocumentTextIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-(--text) m-0 truncate">{title}</p>
                        <p className="text-xs text-(--text-muted) m-0 truncate">/{record.slug}</p>
                    </div>
                </div>
            )
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            width: 140,
            render: (isActive: boolean, record: SitePageRecord) => (
                <div className="flex items-center gap-2">
                    <Switch
                        size="small"
                        checked={isActive}
                        onChange={(checked) => handleTogglePublish(record, checked)}
                    />
                    <span className={`inline-block text-center w-20 text-[10px] font-black uppercase tracking-widest py-1 rounded-lg transition-colors duration-300 ${isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-500/10 text-neutral-400"}`}>
                        {isActive ? "Published" : "Draft"}
                    </span>
                </div>
            )
        },
        {
            title: "Last Updated",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 160,
            render: (date: string) => (
                <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-medium text-(--text)">
                        {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-bold">
                        {new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                </div>
            )
        },
        {
            title: <div className="text-right">Actions</div>,
            key: "actions",
            align: "right" as const,
            width: 120,
            fixed: 'right' as const,
            render: (_: unknown, record: SitePageRecord) => (
                <div className="flex gap-1 justify-end py-1">
                    <Button
                        type="text"
                        icon={<PencilSquareIcon className="w-4 h-4" />}
                        className="text-(--text-muted) hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg"
                        onClick={() => handleOpenModal(record)}
                        title="Edit Page"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<TrashIcon className="w-4 h-4" />}
                        className="hover:bg-red-400/10 rounded-lg"
                        onClick={() => setDeleteTarget(record)}
                        title="Delete Page"
                    />
                </div>
            )
        }
    ];

    const joditConfig = {
        readonly: false,
        theme: "dark",
        height: 600,
        placeholder: 'Start typing here...',
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', 'eraser',
            'ul', 'ol',
            'font', 'fontsize', 'brush',
            'image', 'table', 'link',
            'align', 'undo', 'redo', 'hr', 'copyformat', 'fullsize'
        ],
        disablePlugins: ['speech-recognize', 'print'],
        style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)'
        }
    };

    return (
        <CommonContainer className="py-8">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                        Site Pages
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Manage dynamic pages like About, Privacy, and Terms.
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => handleOpenModal()}
                    style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        border: "none",
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 600,
                        padding: "0 20px"
                    }}
                >
                    Create Page
                </Button>
            </div>

            <div style={{ marginBottom: 20 }}>
                <Input
                    prefix={<MagnifyingGlassIcon style={{ width: 16, height: 16, color: "var(--text-muted)" }} />}
                    placeholder="Search pages..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    size="large"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)", borderRadius: 12, maxWidth: 300 }}
                />
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                {isFetching && !isLoading && (
                    <div style={{ height: 3, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)", backgroundSize: "200%", animation: "shimmer 1.2s linear infinite", borderRadius: 2 }} />
                )}
                <Table
                    columns={columns}
                    dataSource={filteredPages}
                    rowKey="_id"
                    scroll={{ x: 800 }}
                    loading={isLoading}
                    pagination={false}
                    rowClassName={() => "hover:bg-white/[0.015] transition-colors"}
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                open={isModalOpen}
                title={editingPage ? "Edit Page" : "Create New Page"}
                onCancel={handleCloseModal}
                width={900}
                style={{ top: 20 }}
                footer={[
                    <Button key="cancel" onClick={handleCloseModal} style={{ borderRadius: 8 }}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                        loading={createMut.isPending || updateMut.isPending}
                        style={{ background: "#6366f1", borderRadius: 8 }}
                    >
                        {editingPage ? "Save Changes" : "Create Page"}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                    style={{ marginTop: 24 }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="title"
                            label={<span style={{ color: "var(--text-muted)" }}>Page Title</span>}
                            rules={[{ required: true, message: "Title is required" }]}
                        >
                            <Input
                                placeholder="e.g. Privacy Policy"
                                size="large"
                                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                                onChange={(e) => {
                                    if (!editingPage && !form.isFieldTouched("slug")) {
                                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                        form.setFieldsValue({ slug });
                                    }
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="slug"
                            label={<span style={{ color: "var(--text-muted)" }}>URL Slug</span>}
                            rules={[
                                { required: true, message: "Slug is required" },
                                { pattern: /^[a-z0-9-]+$/, message: "Only lowercase letters, numbers, and hyphens" }
                            ]}
                        >
                            <Input
                                prefix={<span className="text-(--text-muted) opacity-50">/</span>}
                                placeholder="privacy-policy"
                                size="large"
                                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                            />
                        </Form.Item>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Page Content</label>
                        <div className="jodit-dark-theme-override">
                            <JoditEditor
                                ref={editorRef}
                                value={editorContent}
                                config={joditConfig}
                                onBlur={newContent => setEditorContent(newContent)}
                            />
                        </div>
                    </div>

                    <Form.Item
                        name="isActive"
                        valuePropName="checked"
                    >
                        <div className="flex items-center gap-3 p-4 rounded-md border border-(--border) bg-(--bg)">
                            <Switch />
                            <div>
                                <p className="m-0 text-sm font-bold text-(--text)">Publish Page</p>
                                <p className="m-0 text-xs text-(--text-muted)">If disabled, page will not be accessible to public.</p>
                            </div>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Modal */}
            {deleteTarget && (
                <Modal
                    open
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <TrashIcon style={{ width: 18, height: 18, color: "#ef4444" }} />
                            <span>Delete Page</span>
                        </div>
                    }
                    onOk={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    okText="Delete"
                    okButtonProps={{ danger: true, loading: deleteMut.isPending }}
                    centered
                >
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>
                        Are you sure you want to delete <strong style={{ color: "var(--text)" }}>&quot;{deleteTarget.title}&quot;</strong>?
                        This action cannot be undone.
                    </p>
                </Modal>
            )}
        </CommonContainer>
    );
}
