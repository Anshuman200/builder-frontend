"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePages, useTemplates, useCreatePage, useDeletePage, usePublishPage, useUnpublishPage, useDuplicatePage, useUpdatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import {
  BoltIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Dropdown, Modal } from "antd";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";
import MediaLibraryView from "@/components/media/MediaLibraryView";
import PillSegmented from "@/components/ui/PillSegmented";


// ─── Types ───────────────────────────────────────────────────────────────────

interface Page {
  _id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  previewUrl?: string;
  isPublic?: boolean;
  category?: string;
  author?: { name: string; _id: string };
  content?: any;
  meta?: any;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        padding: "8px 12px", borderRadius: 12, border: "none",
        background: "transparent", cursor: "pointer",
        color: active ? "#6366f1" : "var(--text-muted)",
        transition: "all 0.2s",
      }}
    >
      <Icon style={{ width: 20, height: 20, strokeWidth: active ? 2.5 : 2 }} />
      <span style={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
  );
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

function getGradient(seed: string) {
  const colors = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #3b82f6, #2dd4bf)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #10b981, #3b82f6)",
  ];
  const str = seed || "default";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function EmptyState({ title, description, icon: Icon, onAction }: { title: string, description: string, icon: any, onAction: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 24,
      border: "1px dashed var(--border)", textAlign: "center", marginTop: 24,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: "rgba(99,102,241,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
      }}>
        <Icon style={{ width: 32, height: 32, color: "#6366f1" }} />
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 300, lineHeight: 1.6, marginBottom: 24 }}>{description}</p>
      <button onClick={onAction} style={{ padding: "12px 24px", borderRadius: 12, background: "#6366f1", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}>
        Get started
      </button>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();

  const { data: pages = [], isLoading: loading } = usePages();
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const createMutation = useCreatePage();
  const deleteMutation = useDeletePage();
  const publishMutation = usePublishPage();
  const unpublishMutation = useUnpublishPage();
  const duplicateMutation = useDuplicatePage();
  const updateMutation = useUpdatePage();

  const [search, setSearch] = useState("");
  const [mainTab, setMainTab] = useState<"projects" | "templates" | "media">("projects");
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
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#6b7280" }}>
        <ArrowPathIcon style={{ width: 32, height: 32, animation: "spin 2s linear infinite" }} />
      </div>
    );
  }

  const items = mainTab === "projects" ? pages : templates;
  const filtered = items.filter((p: Page) => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  console.log("user", user);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Header */}
      <header style={{ height: 60, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 20, position: "sticky", top: 0, background: "var(--bg)", zIndex: 50 }}>
        <BoltIcon style={{ width: 24, height: 24, color: "#6366f1" }} />
        <h1 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>PageCraft</h1>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 400, background: "var(--surface)", borderRadius: 12, padding: "0 12px", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)" }}>
            <MagnifyingGlassIcon style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "10px 0", fontSize: "0.85rem", color: "var(--text)" }}
            />
          </div>
        </div>
        <button onClick={handleCreate} style={{ padding: "8px 16px", borderRadius: 10, background: "var(--text)", color: "var(--bg)", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          + New Page
        </button>
        {/* User Avatar & Logout */}
        <Dropdown
          menu={{
            items: [
              {
                key: "user-info",
                label: (
                  <div style={{ padding: "4px 0" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{user?.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{user?.email}</div>
                  </div>
                ),
                disabled: true,
              },
              {
                key: "profile",
                label: "Profile Settings",
                icon: <PencilIcon style={{ width: 15, height: 15 }} />,
                onClick: () => router.push("/dashboard/profile"),
              },
              { type: "divider" },
              {
                key: "logout",
                label: "Log out",
                danger: true,
                icon: <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />,
                onClick: async () => { await logout(); router.push("/"); },
              },
            ],
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <button
            title={user?.name}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: (user as any)?.profilePic ? "transparent" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              padding: 0,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {(user as any)?.profilePic ? (
              <img 
                src={(user as any).profilePic} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (user?.name || "U").charAt(0).toUpperCase()
            )}
          </button>
        </Dropdown>
      </header>

      <CommonContainer className="py-8">
        <div style={{ marginBottom: 32 }}>
          <PillSegmented
            value={mainTab}
            onChange={(v) => setMainTab(v as any)}
            options={[
              { label: "My Projects", value: "projects" },
              { label: "Templates", value: "templates" },
              { label: "Media", value: "media" },
            ]}
          />
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={mainTab === "projects" ? "No projects yet" : "No templates found"}
            description={mainTab === "projects" ? "Your journey to the perfect landing page starts here." : "Check back later for new inspiration."}
            icon={PlusIcon}
            onAction={handleCreate}
          />
        ) : mainTab === "media" ? (
          <MediaLibraryView />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
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
                        (mainTab === "projects" ? { key: "edit", label: "Edit", icon: <PencilSquareIcon className="w-4 h-4" />, onClick: () => router.push(`/editor/${p._id}`) } : null),
                        (mainTab === "projects" ? { key: "rename", label: "Rename", icon: <PencilIcon className="w-4 h-4" />, onClick: () => { setRenamingId(p._id); setRenameValue(p.title); } } : null),
                        { key: "preview", label: "Preview", icon: <EyeIcon className="w-4 h-4" />, onClick: () => window.open(`/preview/${p._id}`, "_blank") },
                        { key: "duplicate", label: "Duplicate", icon: <Squares2X2Icon className="w-4 h-4" />, onClick: () => duplicateMutation.mutate(p._id) },
                        (mainTab === "projects" ? { key: "publish", label: p.status === 'PUBLISHED' ? "Unpublish" : "Go live", icon: <GlobeAltIcon className="w-4 h-4" />, onClick: () => handleTogglePublish(p) } : null),
                        (mainTab === "projects" ? { key: "delete", label: <span className="text-red-500">Delete</span>, icon: <TrashIcon className="text-red-500 w-4 h-4" />, onClick: () => setDeleteTarget(p) } : null),
                      ].filter(Boolean) as any
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
      </CommonContainer>

      <Modal
        title="Delete Project"
        open={!!deleteTarget}
        onOk={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
      >
        <p>Are you sure you want to delete <b>{deleteTarget?.title}</b>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
