"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePages, useCreatePage, useDeletePage, usePublishPage, useUnpublishPage, useDuplicatePage, useUpdatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import {
  Squares2X2Icon,
  PlusIcon,
  PencilSquareIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Dropdown, Modal } from "antd";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface Page {
  _id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  previewUrl?: string;
  isPublic?: boolean;
}

function timeAgo(dateStr: string) {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function EmptyState({ title, description, onAction }: { title: string, description: string, onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/2 rounded-[2.5rem] border border-dashed border-white/10 text-center mt-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
        <PlusIcon className="w-10 h-10 text-indigo-400" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-8">{description}</p>
      <button 
        onClick={onAction} 
        className="px-8 py-3.5 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20"
      >
        Get started
      </button>
    </div>
  );
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();

  const { data: pages = [], isLoading: loading } = usePages();
  const createMutation = useCreatePage();
  const deleteMutation = useDeletePage();
  const publishMutation = usePublishPage();
  const unpublishMutation = useUnpublishPage();
  const duplicateMutation = useDuplicatePage();
  const updateMutation = useUpdatePage();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleDelete = useCallback(async (page: Page) => {
    try {
      await deleteMutation.mutateAsync(page._id);
      success("Project deleted");
    } catch {
      toastError("Failed to delete project");
    }
    setDeleteTarget(null);
  }, [deleteMutation, success, toastError]);

  const handleCreate = useCallback(async () => {
    try {
      const payload = {
        title: "Untitled Page",
        slug: "untitled-" + Date.now().toString().slice(-4),
        status: "DRAFT",
        isPublic: false,
        content: [],
        meta: {}
      };
      const res = await createMutation.mutateAsync(payload) as any;
      success("Project created");
      router.push(`/editor/${res.data.page._id}`);
    } catch {
      toastError("Failed to create project");
    }
  }, [createMutation, router, success, toastError]);

  const handleRenameSubmit = useCallback(async (page: Page) => {
    if (!renameValue.trim() || renameValue.trim() === page.title) {
      setRenamingId(null);
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: page._id, title: renameValue.trim() });
      success("Renamed successfully");
    } catch {
      toastError("Failed to rename");
    }
    setRenamingId(null);
  }, [renameValue, updateMutation, success, toastError]);

  const handleTogglePublish = useCallback(async (page: Page) => {
    try {
      if (page.status === 'PUBLISHED') {
        await unpublishMutation.mutateAsync(page._id);
        success("Page moved to drafts");
      } else {
        await publishMutation.mutateAsync(page._id);
        success("Page is now live!");
      }
    } catch {
      toastError("Failed to update status");
    }
  }, [publishMutation, unpublishMutation, success, toastError]);

  if (authLoading || (loading && pages.length === 0)) {
    return (
      <header className="h-16 border-b border-white/5 flex items-center px-4 sm:px-8 gap-4 sm:gap-8 sticky top-0 bg-neutral-950/80 backdrop-blur-xl z-50">
        <ArrowPathIcon className="w-10 h-10 animate-spin" />
      </header>
    );
  }

  const filtered = pages.filter((p: Page) => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <DashboardHeader 
        onCreatePage={handleCreate} 
      />

      <CommonContainer className="pt-20 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
            <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white italic mb-4">My Projects</h2>
                <p className="text-white/40 text-[10px] sm:text-xs md:text-base font-medium leading-relaxed">Manage and edit your high-performance landing pages</p>
            </div>

            <div className="w-full md:w-72 bg-white/5 rounded-2xl px-4 flex items-center gap-3 border border-white/5 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all group shrink-0">
              <MagnifyingGlassIcon className="w-4 h-4 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
              <input
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-white placeholder:text-white/20"
              />
            </div>
        </div>

        {pages.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Your journey to the perfect landing page starts here. Create your first project now."
            onAction={handleCreate}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((p: any) => (
              <TemplateCard
                key={p._id}
                template={p}
                variant="dashboard"
                onClick={() => router.push(`/editor/${p._id}`)}
                subtitle={timeAgo(p.updatedAt)}
                isRenaming={renamingId === p._id}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onRenameSubmit={() => handleRenameSubmit(p)}
                actions={
                  <Dropdown
                    menu={{
                      items: [
                        { key: "edit", label: "Edit", icon: <PencilSquareIcon className="w-4 h-4" />, onClick: () => router.push(`/editor/${p._id}`) },
                        { key: "rename", label: "Rename", icon: <PencilIcon className="w-4 h-4" />, onClick: () => { setRenamingId(p._id); setRenameValue(p.title); } },
                        { key: "preview", label: "Preview", icon: <EyeIcon className="w-4 h-4" />, onClick: () => window.open(`/preview/${p._id}`, "_blank") },
                        { key: "duplicate", label: "Duplicate", icon: <Squares2X2Icon className="w-4 h-4" />, onClick: () => duplicateMutation.mutate(p._id) },
                        { key: "publish", label: p.status === 'PUBLISHED' ? "Unpublish" : "Go live", icon: <GlobeAltIcon className="w-4 h-4" />, onClick: () => handleTogglePublish(p) },
                        { key: "delete", label: <span className="text-red-400 font-bold">Delete</span>, icon: <TrashIcon className="text-red-400 w-4 h-4" />, onClick: () => setDeleteTarget(p) },
                      ].filter(Boolean) as any,
                      className: "[&_.ant-dropdown-menu]:bg-neutral-900 [&_.ant-dropdown-menu]:border [&_.ant-dropdown-menu]:border-white/10 [&_.ant-dropdown-menu]:rounded-2xl p-2",
                    }}
                    trigger={['click']}
                  >
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all bg-transparent border-none cursor-pointer">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </Dropdown>
                }
              />
            ))}
          </div>
        )}
      </CommonContainer>

      <Modal
        title={<span className="text-white font-black uppercase tracking-tight">Delete Project</span>}
        open={!!deleteTarget}
        onOk={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending, className: "rounded-xl font-bold uppercase tracking-widest text-[10px]" }}
        cancelButtonProps={{ className: "rounded-xl font-bold uppercase tracking-widest text-[10px] bg-white/5 border-white/10 text-white" }}
        className="[&_.ant-modal-content]:bg-neutral-950 [&_.ant-modal-content]:border [&_.ant-modal-content]:border-white/10 [&_.ant-modal-content]:rounded-4xl [&_.ant-modal-header]:bg-transparent [&_.ant-modal-title]:text-white"
      >
        <p className="text-white/60 text-sm py-4">Are you sure you want to delete <b className="text-white">{deleteTarget?.title}</b>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
