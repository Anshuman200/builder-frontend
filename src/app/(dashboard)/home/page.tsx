"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePages, useDeletePage, usePublishPage, useUnpublishPage, useDuplicatePage, useUpdatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import { useDeleteToast } from "@/context/DeleteToastContext";
import { cn } from "@/lib/utils";
import {
  Squares2X2Icon,
  PencilSquareIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  CameraIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";
import { Dropdown } from "antd";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";
import CapturePreviewModal from "@/components/editor/CapturePreviewModal";
import PasswordUpdateModal from "@/components/shared/PasswordUpdateModal";
import { SearchInput } from "@/components/ui/SearchInput";
import { EllipsisVerticalIcon, KeyIcon } from "@heroicons/react/24/outline";

interface Page {
  _id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  previewUrl?: string;
  isPublic?: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE';
  isLive?: boolean;
  domain?: string;
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

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();

  const { data: pages = [], isLoading: loading } = usePages();
  const deleteMutation = useDeletePage();
  const publishMutation = usePublishPage();
  const unpublishMutation = useUnpublishPage();
  const duplicateMutation = useDuplicatePage();
  const updateMutation = useUpdatePage();

  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [activeTab, setActiveTab] = useState<"all" | "live" | "public" | "private">("all");
  const [showCapturePicker, setShowCapturePicker] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<any | null>(null);

  const { startDelete } = useDeleteToast();
  const [passwordModalId, setPasswordModalId] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleDelete = useCallback((page: Page) => {
    startDelete(
      [{ id: page._id, label: page.title }],
      async (item) => {
        await deleteMutation.mutateAsync(item.id);
      }
    );
  }, [deleteMutation, startDelete]);

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
      if (page.isPublic) {
        await unpublishMutation.mutateAsync(page._id);
        success("Template is now private");
      } else {
        await publishMutation.mutateAsync(page._id);
        success("Template is now public!");
      }
    } catch (err: any) {
      toastError(err.message || "Failed to update public status");
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

  if (loading && pages.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  const filtered = pages.filter((p: Page) => {
    const matchesSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" 
      || (activeTab === "live" && p.isLive);
    return matchesSearch && matchesTab;
  });

  const handlePasswordUpdate = async (password: string) => {
    if (!passwordModalId) return;
    setUpdatingPassword(true);
    try {
      await updateMutation.mutateAsync({ id: passwordModalId, password });
      success("Password updated successfully");
    } catch {
      toastError("Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <>
      <CommonContainer className="pt-5 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white italic mb-4">My Projects</h2>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-base font-medium leading-relaxed">Manage and edit your high-performance landing pages</p>
          </div>

          <SearchInput
            placeholder="Search projects..."
            value={search}
            onChange={v => setSearch(v)}
            className="w-full md:w-72"
            containerStyle={{ background: "rgba(255,255,255,0.05)", borderRadius: 16 }}
            style={{ height: 44, border: "none" }}
          />
        </div>

        {/* Categories / Tabs */}
        <div className="flex items-center gap-2 mb-8 px-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Projects" },
            { id: "live", label: "Live" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border backdrop-blur-md shrink-0",
                activeTab === t.id
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/2 rounded-[2.5rem] border border-dashed border-white/10 text-center mt-6">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Squares2X2Icon className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No projects yet</h3>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-8">Your journey to the perfect landing page starts here. Create your first project now.</p>
          </div>
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
                        { key: "capture", label: "Update Thumbnail", icon: <CameraIcon className="w-4 h-4" />, onClick: () => { setCaptureTarget(p); setShowCapturePicker(true); } },
                        !p.isLive && { key: "preview", label: "Preview", icon: <EyeIcon className="w-4 h-4" />, onClick: () => window.open(`/preview/${p._id}`, "_blank") },
                        !p.isLive && { key: "duplicate", label: "Duplicate", icon: <Squares2X2Icon className="w-4 h-4" />, onClick: () => duplicateMutation.mutate(p._id) },
                        { type: 'divider' },
                        !p.isLive && { key: "delete", label: <span className="text-red-400 font-bold">Delete</span>, icon: <TrashIcon className="text-red-400 w-4 h-4" />, onClick: () => handleDelete(p) },
                      ].filter(Boolean) as any,
                      className: "[&_.ant-dropdown-menu]:bg-neutral-900 [&_.ant-dropdown-menu]:border [&_.ant-dropdown-menu]:border-white/10 [&_.ant-dropdown-menu]:rounded-2xl p-2",
                    }}
                    trigger={['click']}
                  >
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all bg-transparent border-none cursor-pointer">
                      <span className="sr-only">Open menu</span>
                      <EllipsisVerticalIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </button>
                  </Dropdown>
                }
              />
            ))}
          </div>
        )}
      </CommonContainer>

      {captureTarget && (
        <CapturePreviewModal
          open={showCapturePicker}
          onClose={() => { setShowCapturePicker(false); setCaptureTarget(null); }}
          pageId={captureTarget._id}
          previewUrl={typeof window !== 'undefined' ? `${window.location.origin}/preview/${captureTarget._id}` : `/preview/${captureTarget._id}`}
          currentThumbnail={captureTarget.thumbnail}
          existingThumbnails={captureTarget.thumbnails || []}
          onSelect={() => { }} // We handle update in onUpdateThumbnails
          onUpdateThumbnails={handleUpdateThumbnails}
        />
      )}

      <PasswordUpdateModal
        open={!!passwordModalId}
        onClose={() => setPasswordModalId(null)}
        onConfirm={handlePasswordUpdate}
        loading={updatingPassword}
      />
    </>
  );
}
