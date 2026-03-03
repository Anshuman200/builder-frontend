"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  EyeIcon
} from "@heroicons/react/24/outline";
import { useClickOutside } from "@/hooks/useClickOutside";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/hooks/useAuth";
import { usePages, useTemplates, useCreatePage, useDeletePage, usePublishPage, useUnpublishPage, useDuplicatePage, useUpdatePage } from "@/lib/api/queries";
import { ConfirmDialog } from "@/components/ui/glass/ConfirmDialog";
import { useToasts } from "@/hooks/useToasts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  author?: { name: string };
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
  const idx = seed.length % colors.length;
  return colors[idx];
}

function PageCard({ page, onEdit, onDelete, onTogglePublish, onTogglePublic, onDuplicate, onPreview, isTemplateView, isRenaming, renameValue, setRenameValue, onRenameStart, onRenameSubmit }: {
  page: Page, onEdit: () => void, onDelete: () => void, onTogglePublish: () => void, onTogglePublic?: () => void, onDuplicate: () => void, onPreview: () => void, isTemplateView?: boolean, isRenaming?: boolean, renameValue?: string, setRenameValue?: (val: string) => void, onRenameStart?: () => void, onRenameSubmit?: () => void
}) {
  const [hovered, setHovered] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const isPublished = page.status?.toLowerCase() === "published";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        borderRadius: 20,
        border: "1px solid var(--border)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        boxShadow: hovered ? "0 12px 30px rgba(0,0,0,0.12)" : "none",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      {/* Preview area */}
      <div
        onClick={onEdit}
        style={{
          height: 160,
          background: getGradient(page.title),
          position: "relative",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{
          fontSize: "3rem", fontWeight: 900, color: "rgba(255,255,255,0.25)",
          userSelect: "none", transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.5s ease",
        }}>
          {(page.title || "P")[0].toUpperCase()}
        </div>

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <span style={{
            padding: "4px 10px", borderRadius: 30, background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)", color: "white", fontSize: "0.65rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4, border: "1px solid rgba(255,255,255,0.1)",
          }}>
            {isPublished ? <CheckCircleIcon style={{ width: 10, height: 10, color: "#10b981" }} /> : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />}
            {isPublished ? "LIVE" : "DRAFT"}
          </span>
          {page.isPublic && (
            <span style={{
              padding: "4px 10px", borderRadius: 30, background: "rgba(255,255,255,0.9)",
              color: "#6366f1", fontSize: "0.65rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4, border: "1px solid rgba(0,0,0,0.1)",
            }}>
              PUBLIC
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isRenaming && setRenameValue && onRenameSubmit ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={onRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRenameSubmit();
                  if (e.key === 'Escape') {
                    setRenameValue(page.title || "Untitled Project");
                    onRenameSubmit();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text)",
                  width: "100%", background: "var(--bg)", border: "1px solid var(--primary)",
                  borderRadius: 6, padding: "2px 6px", outline: "none",
                }}
              />
            ) : (
              <h3 style={{
                margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {page.title || "Untitled Project"}
              </h3>
            )}
            {isTemplateView && page.author?.name && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2, fontWeight: 500 }}>
                By {page.author.name}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: isTemplateView ? 2 : 4, color: "var(--text-muted)", fontSize: "0.75rem" }}>
              <ClockIcon style={{ width: 12, height: 12 }} />
              <span>{timeAgo(page.updatedAt)}</span>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)", transition: "all 0.2s", outline: "none"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 bg-(--surface) border border-(--border) rounded-xl p-2 shadow-xl z-100"
              >
                {[
                  (!isTemplateView ? { label: "Edit content", Icon: PencilSquareIcon, onClick: onEdit } : null),
                  (!isTemplateView && onRenameStart ? { label: "Rename", Icon: PencilIcon, onClick: onRenameStart } : null),
                  { label: "Preview", Icon: EyeIcon, onClick: onPreview },
                  { label: isTemplateView ? "Use Template" : "Duplicate", Icon: Squares2X2Icon, onClick: onDuplicate },
                  (!isTemplateView ? { label: isPublished ? "Unpublish" : "Go live", Icon: GlobeAltIcon, onClick: onTogglePublish } : null),
                  (!isTemplateView && onTogglePublic ? { label: page.isPublic ? "Set as Private" : "Set as Public", Icon: GlobeAltIcon, onClick: onTogglePublic } : null),
                  (!isTemplateView ? { label: "Delete project", Icon: TrashIcon, onClick: onDelete, danger: true } : null),
                ].filter(Boolean).map((item: any, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={(e) => { e.stopPropagation(); item.onClick(); }}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors ${item.danger
                      ? "text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                      : "text-(--text) hover:bg-(--bg) focus:bg-(--bg)"
                      }`}
                  >
                    <item.Icon style={{ width: 16, height: 16 }} />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      padding: "4rem 2rem", textAlign: "center", borderRadius: 24,
      background: "var(--surface)", border: "1px dashed var(--border)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: "rgba(99,102,241,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1",
      }}>
        <PlusIcon style={{ width: 32, height: 32 }} />
      </div>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px" }}>Create your first page</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 300, margin: "0 auto" }}>
          Start building something amazing. Drag and drop components to create your perfect landing page.
        </p>
      </div>
      <button
        onClick={onCreate}
        style={{
          padding: "12px 24px", borderRadius: 12, background: "#6366f1",
          color: "white", border: "none", fontWeight: 700, cursor: "pointer",
          fontSize: "0.9rem", boxShadow: "0 10px 20px rgba(99,102,241,0.2)",
        }}
      >
        Start building
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
  const [mainTab, setMainTab] = useState<"projects" | "templates">("projects");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileTab, setMobileTab] = useState<"home" | "search" | "recent">("home");
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRenameSubmit = useCallback(async (page: Page) => {
    if (!renameValue.trim() || renameValue.trim() === page.title) {
      setRenamingId(null);
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: page._id, title: renameValue.trim() });
      success("Project renamed");
    } catch {
      toastError("Failed to rename project");
    }
    setRenamingId(null);
  }, [renameValue, updateMutation, success, toastError]);

  const handleRenameStart = useCallback((page: Page) => {
    setRenamingId(page._id);
    setRenameValue(page.title || "Untitled Project");
  }, []);

  const handleCreate = useCallback(async () => {
    try {
      const res = await createMutation.mutateAsync({ title: "Untitled Page" }) as any;
      const id = res.data?.page?._id;
      if (!id) throw new Error("No ID returned");
      success("Page created successfully");
      router.push(`/editor/${id}`);
    } catch {
      toastError("Failed to create page");
    }
  }, [createMutation, router, success, toastError]);

  const handleDelete = useCallback(async (page: Page) => {
    try {
      await deleteMutation.mutateAsync(page._id);
      success("Page deleted");
    } catch {
      toastError("Failed to delete page");
    }
    setDeleteTarget(null);
  }, [deleteMutation, success, toastError]);

  const handleTogglePublish = useCallback(async (page: Page) => {
    try {
      if (page.status?.toLowerCase() === "published") {
        await unpublishMutation.mutateAsync(page._id);
        success("Page unpublished");
      } else {
        await publishMutation.mutateAsync(page._id);
        success("Page published live!");
      }
    } catch {
      toastError("Action failed");
    }
  }, [publishMutation, unpublishMutation, success, toastError]);

  const handleTogglePublic = useCallback(async (page: Page) => {
    try {
      if (page.isPublic) {
        await updateMutation.mutateAsync({ id: page._id, isPublic: false, isTemplate: false });
        success("Project made Private");
      } else {
        await updateMutation.mutateAsync({ id: page._id, isPublic: true, isTemplate: true });
        success("Project made Public");
      }
    } catch {
      toastError("Failed to update visibility");
    }
  }, [updateMutation, success, toastError]);

  const handleDuplicate = useCallback(async (page: Page) => {
    try {
      const res = await duplicateMutation.mutateAsync(page._id) as any;
      success(mainTab === "templates" ? "Template copied to your projects!" : "Page duplicated");
      if (mainTab === "templates") {
        setMainTab("projects");
        if (res?.data?.page?._id) {
          router.push(`/editor/${res.data.page._id}`);
        }
      }
    } catch {
      toastError("Failed to duplicate");
    }
  }, [duplicateMutation, success, toastError, mainTab, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  const filteredPages = pages.filter((p: Page) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTemplates = templates.filter((p: Page) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const activeData = mainTab === "projects" ? filteredPages : filteredTemplates;
  const activeLoading = mainTab === "projects" ? loading : templatesLoading;

  const userInitial = (user?.name || user?.email || "U")[0].toUpperCase();
  const userGradient = getGradient(user?.name || "user");

  return (
    <>
      <style jsx global>{`
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                * { box-sizing: border-box; }
                
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-nav { display: flex !important; }
                    .main-content-area { padding-bottom: 90px !important; }
                    .header-center { display: none !important; }
                }
            `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg)", overflow: "hidden" }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header style={{
          height: 72, borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", background: "var(--surface)", zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BoltIcon style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <span className="desktop-only" style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
              PageCraft
            </span>
          </div>

          {/* Search (Center) */}
          <div className="header-center" style={{ flex: 2, display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: 460, display: "flex", alignItems: "center", gap: 8,
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "0 14px", transition: "all 0.2s",
            }}>
              <MagnifyingGlassIcon style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search pages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "var(--text)", fontSize: "0.85rem", padding: "10px 0",
                }}
              />
            </div>
          </div>

          {/* Actions (Right) */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="desktop-only"
              style={{
                padding: "8px 16px", borderRadius: 10,
                background: "var(--text)", color: "var(--bg)",
                border: "none", fontWeight: 700, fontSize: "0.85rem",
                cursor: "pointer", transition: "opacity 0.2s",
                opacity: createMutation.isPending ? 0.6 : 1,
              }}
            >
              + New Page
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: authLoading ? "var(--bg)" : userGradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                    border: "2px solid var(--border)", outline: "none",
                    opacity: authLoading ? 0.5 : 1
                  }}>
                  {authLoading ? "" : userInitial}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-(--surface) border border-(--border) rounded-xl p-1 shadow-xl z-50 text-(--text)"
              >
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{user?.name || "User"}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: "pointer", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500,
                  }}
                  className="focus:bg-(--bg) cursor-pointer rounded-lg p-2"
                >
                  <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="main-content-area" style={{ flex: 1, overflow: "auto", position: "relative" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>

            {/* Mobile Search Bar (Only visible when mobileTab==="search") */}
            <div className="mobile-only" style={{
              display: mobileTab === "search" ? "block" : "none",
              marginBottom: "1.5rem"
            }}>
              <div style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg)", border: "1px solid var(--primary)",
                borderRadius: 12, padding: "0 14px",
                boxShadow: "0 4px 12px rgba(99,102,241,0.15)"
              }}>
                <MagnifyingGlassIcon style={{ width: 16, height: 16, color: "var(--primary)" }} />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus={mobileTab === "search"}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "var(--text)", fontSize: "0.9rem", padding: "12px 0",
                  }}
                />
              </div>
            </div>

            {/* Section title */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
                    {mainTab === "projects" ? "My Projects" : "Community Templates"}
                  </h1>
                  {!activeLoading && (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                      {activeData.length} {activeData.length === 1 ? (mainTab === "projects" ? "project" : "template") : (mainTab === "projects" ? "projects" : "templates")}
                    </p>
                  )}
                </div>
                {/* Desktop Tabs */}
                <div className="desktop-only" style={{ display: "flex", background: "var(--surface)", padding: 4, borderRadius: 12, border: "1px solid var(--border)" }}>
                  <button onClick={() => setMainTab("projects")} style={{ padding: "6px 16px", borderRadius: 8, background: mainTab === "projects" ? "var(--bg)" : "transparent", border: "1px solid", borderColor: mainTab === "projects" ? "var(--border)" : "transparent", color: mainTab === "projects" ? "var(--text)" : "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>My Projects</button>
                  <button onClick={() => setMainTab("templates")} style={{ padding: "6px 16px", borderRadius: 8, background: mainTab === "templates" ? "var(--bg)" : "transparent", border: "1px solid", borderColor: mainTab === "templates" ? "var(--border)" : "transparent", color: mainTab === "templates" ? "var(--text)" : "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>Templates</button>
                </div>
              </div>

              <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>
                {(["grid", "list"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: viewMode === mode ? "var(--bg)" : "transparent",
                      border: "none", cursor: "pointer",
                      color: viewMode === mode ? "#6366f1" : "var(--text-muted)",
                      transition: "all 0.2s",
                    }}
                  >
                    {mode === "grid" ? <Squares2X2Icon style={{ width: 18, height: 18 }} /> : <ListBulletIcon style={{ width: 18, height: 18 }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading skeleton */}
            {activeLoading && (
              <div style={{
                display: "grid",
                gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr",
                gap: 16,
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    borderRadius: 16, overflow: "hidden",
                    border: "1px solid var(--border)",
                    height: viewMode === "grid" ? 220 : 72,
                    background: "linear-gradient(90deg, var(--surface) 25%, var(--bg) 50%, var(--surface) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!activeLoading && activeData.length === 0 && (
              mainTab === "projects" ? <EmptyState onCreate={handleCreate} /> : <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)" }}>No public templates found. Be the first to publish one!</div>
            )}

            {/* Page grid */}
            {!activeLoading && activeData.length > 0 && viewMode === "grid" && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}>
                {activeData.map((page: Page) => (
                  <PageCard
                    key={page._id}
                    page={page}
                    onEdit={() => mainTab === "projects" ? router.push(`/editor/${page._id}`) : handleDuplicate(page)}
                    onPreview={() => window.open(`/preview/${page._id}`, "_blank")}
                    onDelete={() => setDeleteTarget(page)}
                    onTogglePublish={() => handleTogglePublish(page)}
                    onTogglePublic={() => handleTogglePublic(page)}
                    onDuplicate={() => handleDuplicate(page)}
                    isTemplateView={mainTab === "templates"}
                    isRenaming={renamingId === page._id}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    onRenameStart={() => handleRenameStart(page)}
                    onRenameSubmit={() => handleRenameSubmit(page)}
                  />
                ))}
              </div>
            )}

            {/* List view */}
            {!activeLoading && activeData.length > 0 && viewMode === "list" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeData.map((page: Page) => {
                  const isPublished = page.status?.toLowerCase() === "published";
                  const isTemplateView = mainTab === "templates";
                  return (
                    <div key={page._id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "1rem", borderRadius: 16,
                      background: "var(--surface)", border: "1px solid var(--border)",
                      transition: "all 0.2s", cursor: "pointer",
                    }}
                      onClick={() => router.push(`/editor/${page._id}`)}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                        background: getGradient(page.title), display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontWeight: 800, color: "white", fontSize: "1.1rem",
                      }}>
                        {(page.title || "P")[0].toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {renamingId === page._id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRenameSubmit(page)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSubmit(page);
                              if (e.key === 'Escape') {
                                setRenameValue(page.title || "Untitled Project");
                                handleRenameSubmit(page);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text)",
                              width: "100%", maxWidth: 300, background: "var(--bg)", border: "1px solid var(--primary)",
                              borderRadius: 6, padding: "2px 6px", outline: "none",
                            }}
                          />
                        ) : (
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {page.title || "Untitled"}
                          </div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          {mainTab === "projects" && (
                            <span style={{
                              padding: "2px 8px", borderRadius: 10,
                              background: isPublished ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                              color: isPublished ? "#10b981" : "#f59e0b",
                              fontWeight: 700, fontSize: "0.65rem",
                            }}>{isPublished ? "PUBLISHED" : "DRAFT"}</span>
                          )}
                          {page.category && mainTab === "templates" && (
                            <span style={{
                              padding: "2px 8px", borderRadius: 10,
                              background: "rgba(99,102,241,0.1)",
                              color: "#6366f1",
                              fontWeight: 700, fontSize: "0.65rem",
                            }}>{page.category}</span>
                          )}
                          <span><ClockIcon style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle" }} /> {timeAgo(page.updatedAt)}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => window.open(`/preview/${page._id}`, "_blank")} title="Preview" style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: "var(--bg)", border: "1px solid transparent",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--text-muted)", transition: "all 0.2s",
                        }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "transparent"}>
                          <EyeIcon style={{ width: 16, height: 16 }} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "transparent", border: "1px solid transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--text-muted)", transition: "all 0.2s",
                              }}
                              onMouseEnter={e => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "var(--bg)";
                                target.style.borderColor = "var(--border)";
                              }}
                              onMouseLeave={e => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "transparent";
                                target.style.borderColor = "transparent";
                              }}
                            >
                              <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-(--surface) border border-(--border) rounded-xl p-2 shadow-xl z-100">
                            {[
                              (!isTemplateView ? { label: "Edit content", Icon: PencilSquareIcon, onClick: () => router.push(`/editor/${page._id}`) } : null),
                              (!isTemplateView ? { label: "Rename", Icon: PencilIcon, onClick: () => handleRenameStart(page) } : null),
                              { label: "Preview", Icon: EyeIcon, onClick: () => window.open(`/preview/${page._id}`, "_blank") },
                              { label: isTemplateView ? "Use Template" : "Duplicate", Icon: Squares2X2Icon, onClick: () => handleDuplicate(page) },
                              (!isTemplateView ? { label: isPublished ? "Unpublish" : "Go live", Icon: GlobeAltIcon, onClick: () => handleTogglePublish(page) } : null),
                              (!isTemplateView ? { label: page.isPublic ? "Make Private" : "Make Public", Icon: GlobeAltIcon, onClick: () => handleTogglePublic(page) } : null),
                              (!isTemplateView ? { label: "Delete project", Icon: TrashIcon, onClick: () => setDeleteTarget(page), danger: true } : null),
                            ].filter(Boolean).map((item: any, i) => (
                              <DropdownMenuItem
                                key={i}
                                onClick={(e) => { e.stopPropagation(); item.onClick(); }}
                                className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors ${item.danger
                                  ? "text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                                  : "text-(--text) hover:bg-(--bg) focus:bg-(--bg)"
                                  }`}
                              >
                                <item.Icon style={{ width: 16, height: 16 }} />
                                {item.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ── Bottom Tab Nav (Mobile) ────────────────────────────────── */}
        <div className="mobile-nav" style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: 72, background: "rgba(24,24,27,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "0 8px 12px", zIndex: 1000,
          boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
          borderRadius: "20px 20px 0 0",
        }}>
          <NavItem
            icon={Squares2X2Icon} label="Home"
            active={mobileTab === "home"}
            onClick={() => { setMobileTab("home"); setViewMode("grid"); window.scrollTo(0, 0); }}
          />
          <NavItem
            icon={MagnifyingGlassIcon} label="Search"
            active={mobileTab === "search"}
            onClick={() => { setMobileTab("search"); window.scrollTo(0, 0); }}
          />

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", color: "white", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 20px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            <PlusIcon style={{ width: 24, height: 24, strokeWidth: 3 }} />
          </button>

          <NavItem
            icon={ClockIcon} label="Recent"
            active={mobileTab === "recent"}
            onClick={() => { setMobileTab("recent"); setViewMode("list"); window.scrollTo(0, 0); }}
          />
          <NavItem
            icon={ArrowRightOnRectangleIcon} label="Logout"
            onClick={logout}
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        icon={<TrashIcon style={{ width: 22, height: 22 }} />}
        iconColor="#ef4444"
        title="Delete page?"
        subtitle="This cannot be undone"
        description={deleteTarget ? <><strong style={{ color: "rgba(255,255,255,0.85)" }}>&ldquo;{deleteTarget.title}&rdquo;</strong> will be permanently deleted.</> : undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
