"use client";

import { useState, useDeferredValue, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    ClockIcon,
    PlusIcon,
    EllipsisVerticalIcon,
    PencilSquareIcon,
    PencilIcon,
    TrashIcon,
    GlobeAltIcon,
    EyeIcon,
    Squares2X2Icon,
    ArrowPathIcon,
    CameraIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
    useAdminTemplates,
    useCreatePage,
    useDeletePage,
    usePublishPage,
    useUnpublishPage,
    useDuplicatePage,
    useUpdatePage
} from "@/lib/api/queries";
import { TemplatePreviewModal } from "@/components/admin/TemplatePreviewModal";
import CapturePreviewModal from "@/components/editor/CapturePreviewModal";
import { Button, Input, Select, Skeleton, Dropdown } from "antd";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";
import { useToasts } from "@/hooks/useToasts";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";
import PillSegmented from "@/components/ui/PillSegmented";
import NewPageWizard from "@/components/editor/NewPageWizard";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import { useCallback } from "react";

const SECTION_ID_MAP: Record<string, string> = {
    header: "nav-", hero: "hero-", features: "features-",
    stats: "stats-", team: "team-", testimonials: "testimonials-",
    pricing: "pricing-", contact: "contact-", cta: "cta-",
    gallery: "gallery-", faq: "faq-", footer: "footer-",
};

function buildContentFromSections(sectionIds: string[]) {
    const sorted = [
        ...sectionIds.filter((id) => id === "header"),
        ...sectionIds.filter((id) => id !== "header" && id !== "footer"),
        ...sectionIds.filter((id) => id === "footer"),
    ];
    return sorted.map((id) => {
        const prefix = SECTION_ID_MAP[id];
        if (!prefix) return null;
        const template = SECTION_TEMPLATES.find((t) => t.id.startsWith(prefix));
        return template ? template.create() : null;
    }).filter(Boolean);
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const GRADIENTS = [
    "from-indigo-500 to-violet-600",
    "from-blue-500 to-cyan-400",
    "from-amber-500 to-rose-500",
    "from-emerald-500 to-blue-500",
];
const getGradient = (seed: string) => GRADIENTS[seed.length % GRADIENTS.length];

type Visibility = "all" | "public" | "private";

const VISIBILITY_TABS: { key: Visibility; label: string }[] = [
    { key: "all", label: "All" },
    { key: "public", label: "Public" },
    { key: "private", label: "Private" },
];

export default function AdminTemplatesPage() {
    const toast = useToasts();
    const { success, error: toastError } = toast;
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState<Visibility>("all");
    const [sortBy, setSortBy] = useState("updatedAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [preview, setPreview] = useState<{ id: string; title: string } | null>(null);

    const createMutation = useCreatePage();
    const deleteMutation = useDeletePage();
    const publishMutation = usePublishPage();
    const unpublishMutation = useUnpublishPage();
    const duplicateMutation = useDuplicatePage();
    const updateMutation = useUpdatePage();

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    const [showCapturePicker, setShowCapturePicker] = useState(false);
    const [captureTarget, setCaptureTarget] = useState<any | null>(null);


    const [wizardOpen, setWizardOpen] = useState(false);
    const deferredSearch = useDeferredValue(search);

    const params: Record<string, string> = { visibility, sortBy, order, page: String(page), limit: "24" };
    if (deferredSearch) params.search = deferredSearch;

    const { data, isLoading, isError, error: queryError } = useAdminTemplates(params);
    const templates = data?.templates ?? [];
    const totalPages = data?.pages ?? 1;

    useEffect(() => {
        if (isError) toastError((queryError as Error)?.message ?? "Failed to load templates");
    }, [isError]);

    const handleCreate = () => setWizardOpen(true);

    const handleWizardSubmit = useCallback(async (title: string, slug: string, selectedSections: string[]) => {
        try {
            const content = buildContentFromSections(selectedSections);
            const payload = {
                title,
                slug: slug || "template-" + Date.now().toString().slice(-4),
                status: "DRAFT",
                isPublic: false,
                content,
                meta: {}
            };
            const res = await createMutation.mutateAsync(payload) as any;
            success("Template created!");
            setWizardOpen(false);
            router.push(`/editor/${res.data.page._id}`);
        } catch (err) {
            toastError("Failed to create template");
        }
    }, [createMutation, router, success, toastError]);

    const handleRenameSubmit = useCallback(async (tpl: any) => {
        if (!renameValue.trim() || renameValue.trim() === tpl.title) {
            setRenamingId(null);
            return;
        }
        try {
            await updateMutation.mutateAsync({ id: tpl._id, title: renameValue.trim() });
            success("Renamed successfully");
        } catch {
            toastError("Failed to rename");
        }
        setRenamingId(null);
    }, [renameValue, updateMutation, success, toastError]);

    const handleTogglePublish = useCallback(async (tpl: any) => {
        try {
            if (tpl.status === 'PUBLISHED') {
                await unpublishMutation.mutateAsync(tpl._id);
                success("Moved to drafts");
            } else {
                await publishMutation.mutateAsync(tpl._id);
                success("Template is now live!");
            }
        } catch {
            toastError("Failed to update status");
        }
    }, [publishMutation, unpublishMutation, success, toastError]);

    const handleUpdateThumbnails = async (newThumbnails: string[], active: string | null) => {
        if (!captureTarget) return;
        try {
            await updateMutation.mutateAsync({
                id: captureTarget._id,
                thumbnail: active || undefined,
                thumbnails: newThumbnails,
            } as any);
            success('Thumbnail updated!');
        } catch (e) {
            console.error('Thumbnail update failed', e);
            toastError('Failed to save thumbnail');
        }
    };

    const handleDelete = useCallback((tpl: any) => {
        toast.promise(deleteMutation.mutateAsync(tpl._id), {
            loading: `Deleting ${tpl.title}...`,
            success: `${tpl.title} deleted`,
            error: (err: any) => err.message || `Failed to delete ${tpl.title}`
        });
    }, [deleteMutation, toast]);

    return (
        <CommonContainer className="py-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h1 className="m-0 text-2xl font-extrabold text-(--text) tracking-tight">
                        Templates
                    </h1>
                    <p className="mt-1 text-sm text-(--text-muted)">
                        {data ? `${data.total} total templates` : "Loading..."}
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={handleCreate}
                    size="large"
                    className="h-11 px-6 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 border-none shadow-lg shadow-indigo-500/20 text-white"
                >
                    New Template
                </Button>
            </div>

            {/* Filters row */}
            <div className="flex gap-3 mb-6 flex-wrap items-center">
                {/* Visibility tabs */}
                <PillSegmented
                    value={visibility}
                    onChange={(v) => { setVisibility(v as Visibility); setPage(1); }}
                    options={VISIBILITY_TABS.map(tab => ({ label: tab.label, value: tab.key }))}
                />

                {/* Search */}
                <div className="flex-1 min-w-[220px]">
                    <SearchInput
                        placeholder="Search by title..."
                        value={search}
                        onChange={v => { setSearch(v); setPage(1); }}
                        width="100%"
                        style={{ height: 44 }}
                    />
                </div>

                {/* Sort */}
                <Select
                    value={`${sortBy}:${order}`}
                    onChange={value => {
                        const [f, o] = value.split(":");
                        setSortBy(f); setOrder(o as "asc" | "desc"); setPage(1);
                    }}
                    size="large"
                    className="w-[180px]"
                    popupMatchSelectWidth={false}
                    options={[
                        { label: "Newest first", value: "updatedAt:desc" },
                        { label: "Oldest first", value: "updatedAt:asc" },
                        { label: "Title A→Z", value: "title:asc" },
                        { label: "Title Z→A", value: "title:desc" },
                    ]}
                />
            </div>

            {/* Skeleton loading */}
            {isLoading && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-64 bg-(--surface) border border-(--border) rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && templates.length === 0 && (
                <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-(--border) text-(--text-muted) text-sm">
                    No templates found matching your filters.
                </div>
            )}

            {/* Grid */}
            {!isLoading && templates.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                    {templates.map((tpl: any) => (
                        <TemplateCard
                            key={tpl._id}
                            template={tpl}
                            onClick={() => setPreview({ id: tpl._id, title: tpl.title })}
                            variant="admin"
                            subtitle={timeAgo(tpl.updatedAt)}
                            isRenaming={renamingId === tpl._id}
                            renameValue={renameValue}
                            setRenameValue={setRenameValue}
                            onRenameSubmit={() => handleRenameSubmit(tpl)}
                            actions={
                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: "edit", label: "Edit", icon: <PencilSquareIcon className="w-4 h-4" />, onClick: () => router.push(`/editor/${tpl._id}`) },
                                            { key: "rename", label: "Rename", icon: <PencilIcon className="w-4 h-4" />, onClick: () => { setRenamingId(tpl._id); setRenameValue(tpl.title); } },
                                            { key: "capture", label: "Update Thumbnail", icon: <CameraIcon className="w-4 h-4" />, onClick: () => { setCaptureTarget(tpl); setShowCapturePicker(true); } },
                                            { key: "preview", label: "Preview", icon: <EyeIcon className="w-4 h-4" />, onClick: () => setPreview({ id: tpl._id, title: tpl.title }) },
                                            { key: "duplicate", label: "Duplicate", icon: <Squares2X2Icon className="w-4 h-4" />, onClick: () => duplicateMutation.mutate(tpl._id) },
                                            { key: "publish", label: tpl.status === 'PUBLISHED' ? "Unpublish" : "Go live", icon: <GlobeAltIcon className="w-4 h-4" />, onClick: () => handleTogglePublish(tpl) },
                                            { key: "delete", label: <span className="text-red-500">Delete</span>, icon: <TrashIcon className="text-red-500 w-4 h-4" />, onClick: () => handleDelete(tpl) },
                                        ]
                                    }}
                                    trigger={['click']}
                                >
                                    <button className="text-zinc-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                </Dropdown>
                            }
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                        .map(p => (
                            <Button
                                key={p}
                                type={p === page ? "primary" : "default"}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    <Button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Preview modal */}
            {preview && (
                <TemplatePreviewModal
                    pageId={preview.id}
                    pageTitle={preview.title}
                    onClose={() => setPreview(null)}
                />
            )}


            {captureTarget && (
                <CapturePreviewModal
                    open={showCapturePicker}
                    onClose={() => { setShowCapturePicker(false); setCaptureTarget(null); }}
                    pageId={captureTarget._id}
                    previewUrl={typeof window !== 'undefined' ? `${window.location.origin}/preview/${captureTarget._id}` : `/preview/${captureTarget._id}`}
                    currentThumbnail={captureTarget.thumbnail}
                    existingThumbnails={captureTarget.thumbnails || []}
                    onSelect={() => { }}
                    onUpdateThumbnails={handleUpdateThumbnails}
                />
            )}

            <NewPageWizard
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onSubmit={handleWizardSubmit}
                isSubmitting={createMutation.isPending}
            />
        </CommonContainer>
    );
}
