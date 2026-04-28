"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  BoltIcon as ZapIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  AdjustmentsHorizontalIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
  PhotoIcon,
  TrashIcon,
  MoonIcon,
  SunIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  PlusIcon,
  DocumentIcon,
  SparklesIcon,
  DocumentPlusIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { Popover, Dropdown, Drawer, Switch, ColorPicker } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { slugify } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { pagesApi } from "@/lib/api/client";
import { clearLocalDraft } from "@/lib/utils/storage";
import { useToasts } from "@/hooks/useToasts";
import { useUpdatePage, useCreatePage, usePublishPage } from "@/lib/api/queries";
import CapturePreviewModal from "@/components/editor/CapturePreviewModal";
import BlockPalette from "./BlockPalette";
import MediaPicker from "@/components/editor/MediaPicker";
import { DEFAULT_THEME } from "@/stores/editorStore";
import NewPageWizard from "@/components/editor/NewPageWizard";
import { ConfigProvider, theme as antdTheme } from "antd";
import { PANEL_COLORS } from "./panels/shared";

export default function EditorToolbar() {
  const {
    page, viewMode, isDirty,
    historyIndex, history,
    setViewMode, undo, redo,
    updateTitle, updateSlug, updateMeta, updateTheme, updatePageData, markClean,
    activeRouteId, setActiveRoute, addRoute,
    openTemplatePicker, openWizard,
  } = useEditorStore();
  const { pageId } = useParams<{ pageId: string }>() ?? {};
  const router = useRouter();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { user, logout } = useAuth();
  const { success } = useToasts();
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCapturePicker, setShowCapturePicker] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<"favicon" | "ogImage" | null>(null);
  const [showNewPageMenu, setShowNewPageMenu] = useState(false);

  const theme = page?.theme || DEFAULT_THEME;
  const colors = theme.colors || DEFAULT_THEME.colors;

  const updateMutation = useUpdatePage();
  const createMutation = useCreatePage();
  const publishMutation = usePublishPage();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Helper to format payload for backend
  const getPlainPayload = (thumbnailUrl?: string | null) => {
    if (!page) return null;

    const payload: any = {
      title: page.title,
      slug: page.slug,
      content: page.content || [],
      routes: page.routes || [],
      globalBlocks: page.globalBlocks || { header: null, footer: null },
      theme: page.theme || DEFAULT_THEME,
      meta: page.meta || {},
      category: page.category || 'Other',
      status: page.status || 'DRAFT'
    };

    if (thumbnailUrl !== undefined) {
      payload.thumbnail = thumbnailUrl;
    }

    return payload;
  };

  // Fire-and-forget: keep preview cache in sync with every save
  const pushPreviewCache = (payload?: any) => {
    const data = payload || (page ? { ...page } : null);
    if (!data || !pageId || pageId.length < 24) return;
    fetch(`/api/preview/${pageId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => { });
  };

  // Handle thumbnail selection from capture or media library
  const handleUpdateThumbnails = async (newThumbnails: string[], active: string | null) => {
    updatePageData({
      thumbnail: active,
      thumbnails: newThumbnails
    });

    if (!pageId || pageId.length < 24) return;
    try {
      await updateMutation.mutateAsync({
        id: pageId,
        thumbnail: active || undefined,
        thumbnails: newThumbnails,
      } as any);
      success('Thumbnail saved!');
    } catch (e) {
      console.error('Thumbnail save failed', e);
    }
  };


  // Auto-save effect
  useEffect(() => {
    if (!user || !pageId || !isDirty || isSaving) return;
    if (pageId.length < 24) return;

    const timeoutId = setTimeout(async () => {
      try {
        const payload = getPlainPayload();
        if (!payload || !isDirty) return;
        setIsSaving(true);
        await updateMutation.mutateAsync({ id: pageId, ...payload });
        markClean();
        clearLocalDraft(pageId);
        pushPreviewCache(payload);
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [page, user, pageId, isDirty, isSaving, markClean]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘Z or Ctrl+Z for Undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // ⌘⇧Z or Ctrl+Shift+Z or ⌘Y for Redo
      if (((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) || ((e.metaKey || e.ctrlKey) && e.key === "y")) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);


  // Sync / Auto-save on Login
  useEffect(() => {
    // If user just logged in and has unsaved changes, persist them!
    if (user && isDirty && !isSaving) {
      handleSave();
    }
  }, [user]);

  async function handleSave() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!pageId || !page) return;

    setIsSaving(true);
    try {
      if (pageId.length < 24) {
        const payload = getPlainPayload();
        if (!payload) return;
        const res = await createMutation.mutateAsync(payload);
        const newId = (res as any).data.page._id;
        markClean();
        clearLocalDraft(pageId);
        clearLocalDraft(newId);
        router.replace(`/editor/${newId}`);
        return;
      }
      const payload = getPlainPayload();
      if (!payload) return;
      await updateMutation.mutateAsync({ id: pageId, ...payload });
      markClean();
      clearLocalDraft(pageId);
      pushPreviewCache(payload);
    } catch (e) {
      console.error("Manual save failed", e);
    } finally {
      setIsSaving(false);
    }
  }


  function openPreview() {
    if (!pageId) return;
    const previewUrl = typeof window !== "undefined" ? `${window.location.origin}/preview/${pageId}` : `/preview/${pageId}`;

    // Open immediately to avoid popup blockers
    const newWin = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;

    if (page) {
      fetch(`/api/preview/${pageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      }).then(() => {
        if (newWin) newWin.location.href = previewUrl;
      }).catch((e) => {
        console.error(e);
        if (newWin) newWin.location.href = previewUrl;
      });
    } else if (newWin) {
      newWin.location.href = previewUrl;
    }
  }

  function startTitleEdit() {
    setTitleDraft(page?.title || "");
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function commitTitle() {
    const t = titleDraft.trim() || "Untitled Page";
    updateTitle(t);
    setEditingTitle(false);
  }

  const viewModes = [
    { key: "desktop" as const, icon: ComputerDesktopIcon, label: "Desktop" },
    { key: "tablet" as const, icon: DeviceTabletIcon, label: "Tablet (768px)" },
    { key: "mobile" as const, icon: DevicePhoneMobileIcon, label: "Mobile (390px)" },
  ];

  async function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    const target = !user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home";

    // Force commit title if currently editing
    if (editingTitle) {
      const t = titleDraft.trim() || "Untitled Page";
      updateTitle(t);
      setEditingTitle(false);
    }

    if (isDirty && user && pageId && pageId.length >= 24) {
      setIsSaving(true);
      try {
        const payload = getPlainPayload();
        if (payload) {
          await updateMutation.mutateAsync({ id: pageId, ...payload });
          markClean();
          clearLocalDraft(pageId);
        }
      } catch (e) {
        console.error("Save before navigation failed", e);
      } finally {
        setIsSaving(false);
      }
    }
    router.push(target);
  }

  // ── Page Switcher ─────────────────────────────────────────────────────────
  const routes = page?.routes || [];
  const activeRoute = routes.find(r => r.id === activeRouteId) || routes[0];

  const pageMenuItems = [
    {
      key: 'header',
      label: <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", padding: "4px 8px" }}>Screens / Pages</span>,
      disabled: true,
    },
    ...routes.map(r => ({
      key: r.id,
      onClick: () => {
        setActiveRoute(r.id);
        router.push(`?route=${r.id}`, { scroll: false });
      },
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
          <DocumentIcon style={{ width: 14, height: 14, opacity: 0.6 }} />
          <span style={{ fontSize: 13, fontWeight: r.id === activeRouteId ? 600 : 400, color: r.id === activeRouteId ? "var(--primary)" : "inherit" }}>
            {r.name}
          </span>
          {r.id === activeRouteId && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />}
        </div>
      )
    })),
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: PANEL_COLORS.primary,
          colorBgContainer: "#111111",
          colorBorder: "rgba(255,255,255,0.08)",
          colorText: "#ffffff",
          colorTextDescription: "rgba(255,255,255,0.45)",
          colorBgElevated: "#0a0a0a",
          borderRadius: 12,
        },
      }}
    >
      <header style={{
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        gap: 12,
        background: PANEL_COLORS.bg,
        borderBottom: `1px solid ${PANEL_COLORS.border}`,
        zIndex: 50,
      }}>
        {/* ... existing header content ... */}

        {/* Left — logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <a
            href={!user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home"}
            onClick={handleLogoClick}
            style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ZapIcon style={{ width: 14, height: 14 }} color="#fff" />
            </div>
          </a>
          <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--primary)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                outline: "none",
                minWidth: 0,
                maxWidth: 200,
              }}
            />
          ) : (
            <button
              onClick={startTitleEdit}
              title="Click to rename"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                padding: "3px 6px",
                borderRadius: 6,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {page?.title || "Untitled Page"}
            </button>
          )}
          <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0, margin: "0 4px" }} />

          {/* Page Switcher */}
          <Dropdown menu={{ items: pageMenuItems }} trigger={['click']} placement="bottomLeft">
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", height: 32,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
              minWidth: 120, justifyContent: "space-between"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <DocumentIcon style={{ width: 14, height: 14, color: "var(--primary)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeRoute?.name || "Select Page"}
                </span>
              </div>
              <ChevronDownIcon style={{ width: 12, height: 12, color: "var(--text-muted)" }} />
            </button>
          </Dropdown>

          <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0, margin: "0 4px" }} />
          <BlockPalette />

          {/* ── Add New Page Button ── */}
          <Popover
            open={showNewPageMenu}
            onOpenChange={setShowNewPageMenu}
            trigger="click"
            placement="bottomLeft"
            arrow={false}
            overlayInnerStyle={{ padding: 0, background: "transparent", boxShadow: "none" }}
            content={
              <div style={{
                width: 240,
                background: "linear-gradient(145deg, #0d0d14 0%, #0f0f1a 100%)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}>
                {/* Header */}
                <div style={{
                  padding: "14px 16px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(99,102,241,0.06)",
                }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "rgba(165,163,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Add New Page</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Choose how to start</p>
                </div>

                {/* Option 1: Blank */}
                <button
                  onClick={() => {
                    openWizard(true);
                    setShowNewPageMenu(false);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", background: "transparent", border: "none",
                    cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <DocumentPlusIcon style={{ width: 16, height: 16, color: "#818cf8" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Blank Page</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Start with a clean canvas</p>
                  </div>
                </button>

                {/* Option 2: Wizard */}
                <button
                  onClick={() => {
                    openWizard(false);
                    setShowNewPageMenu(false);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", background: "transparent", border: "none",
                    cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.1))",
                    border: "1px solid rgba(16,185,129,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <SparklesIcon style={{ width: 16, height: 16, color: "#34d399" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Use Wizard</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Pick sections to pre-fill</p>
                  </div>
                </button>

                {/* Footer hint */}
                <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.04em" }}>
                    {routes.length} page{routes.length !== 1 ? "s" : ""} in this project
                  </p>
                </div>
              </div>
            }
          >
            <button
              className="flex items-center gap-2 bg-linear-to-r from-blue/10 to-green/10 border border-primary/30 hover:from-primary/20 hover:to-primary/12 hover:border-primary/50 transition-all duration-200 rounded-lg px-3 py-1.5 text-primary font-bold text-xs tracking-wide cursor-pointer min-w-32"
            >
              <PlusIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />
              New Page
              <ChevronDownIcon style={{
                width: 11, height: 11, strokeWidth: 2.5,
                transition: "transform 0.2s",
                transform: showNewPageMenu ? "rotate(180deg)" : "rotate(0deg)",
              }} />
            </button>
          </Popover>

          {/* ── Choose Template Button ── */}
          <button
            onClick={openTemplatePicker}
            className="flex items-center gap-2 bg-linear-to-r from-green-400/10 to-emerald-400/10 border border-green-400/30 hover:from-green-400/20 hover:to-emerald-400/12 hover:border-green-400/50 transition-all duration-200 rounded-lg px-3 py-1.5 text-green-400 font-bold text-xs tracking-wide cursor-pointer min-w-36"
          >
            <SparklesIcon style={{ width: 13, height: 13, strokeWidth: 2.5 }} />
            Choose Template
          </button>
        </div>

        {/* Center — viewport switcher */}
        <div style={{ display: "flex", gap: 2, background: "var(--surface)", borderRadius: 8, padding: 3 }}>
          {viewModes.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              title={label}
              onClick={() => setViewMode(key)}
              style={{
                width: 32, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: viewMode === key ? "var(--primary)" : "transparent",
                color: viewMode === key ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>

        {/* Right — save indicator, undo/redo, settings */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>

          {/* Save status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, color: "var(--text-muted)", minWidth: 80 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isSaving ? "var(--primary)" : isDirty ? "#f59e0b" : "#10b981",
              boxShadow: isSaving ? "0 0 8px var(--primary)" : "none",
              transition: "all 0.2s ease",
              display: "inline-block"
            }} />
            {isSaving ? "Saving..." : isDirty ? "Unsaved" : "Saved"}
          </div>

          {/* Undo / Redo */}
          <div style={{ display: "flex", gap: 2 }}>
            <IconBtn onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
              <ArrowUturnLeftIcon style={{ width: 14, height: 14 }} />
            </IconBtn>
            <IconBtn onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
              <ArrowUturnRightIcon style={{ width: 14, height: 14 }} />
            </IconBtn>
          </div>

          {/* Save Draft button */}
          <button
            onClick={handleSave}
            disabled={isSaving || (!isDirty && !!user)}
            title="Save Changes"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px",
              background: "var(--surface)",
              color: (isDirty || !user) ? "var(--text)" : "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: isSaving || (!isDirty && !!user) ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          {/* Thumbnail capture button */}
          {user && (
            <button
              onClick={() => setShowCapturePicker(true)}
              title="Capture page thumbnail"
              className="size-8 bg-violet-700 flex justify-center items-center rounded-full cursor-pointer hover:scale-105"
            >
              {page?.thumbnail ? (
                <span style={{ position: "relative", width: 14, height: 14, flexShrink: 0 }}>
                  <img
                    src={page.thumbnail}
                    alt=""
                    style={{ width: 14, height: 14, borderRadius: 3, objectFit: "cover" }}
                  />
                </span>
              ) : (
                <CameraIcon style={{ width: 16, height: 16 }} />
              )}
            </button>
          )}

          {/* Preview button */}
          <button
            onClick={openPreview}
            title="Preview page"
            className="size-8 bg-violet-700 flex justify-center items-center rounded-full cursor-pointer hover:scale-105"
          >
            <EyeIcon style={{ width: 16, height: 16 }} />
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDrawerOpen(true)}
              title="Page settings"
              className="size-8 bg-violet-700 flex justify-center items-center rounded-full cursor-pointer hover:scale-105"
            >
              <CogIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* User Menu / Login Button */}
          {user ? (
            <div style={{ position: "relative" }}>
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{
                  items: [
                    {
                      key: 'header',
                      label: (
                        <div style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "inherit" }}>{user?.name || "User"}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
                        </div>
                      ),
                      disabled: true,
                      style: { cursor: 'default' }
                    },
                    {
                      key: 'logout',
                      onClick: async () => {
                        await logout();
                        router.push("/");
                      },
                      label: (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 }}>
                          <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                          Log out
                        </div>
                      ),
                    }
                  ]
                }}
              >
                <button
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981, #3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                    border: "2px solid var(--border)", outline: "none"
                  }}>
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </button>
              </Dropdown>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: "var(--primary)",
                color: "white",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s",
                boxShadow: "0 2px 6px rgba(99,102,241,0.25)"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Sign In
            </button>
          )}
        </div>

        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="login"
          redirectOnSuccess={false}
        />

        {/* Capture Preview Modal */}
        {user && pageId && pageId.length >= 24 && (
          <CapturePreviewModal
            open={showCapturePicker}
            onClose={() => setShowCapturePicker(false)}
            pageId={pageId}
            previewUrl={typeof window !== 'undefined' ? `${window.location.origin}/preview/${pageId}?capture=true` : `/preview/${pageId}?capture=true`}
            currentThumbnail={page?.thumbnail || null}
            existingThumbnails={page?.thumbnails || []}
            onSelect={(url) => { updatePageData({ thumbnail: url }); }}
            onUpdateThumbnails={handleUpdateThumbnails}
          />
        )}

        {/* Media Picker for Favicon/OG Image */}
        <MediaPicker
          open={!!mediaPickerType}
          onClose={() => setMediaPickerType(null)}
          title={mediaPickerType === 'favicon' ? 'Select Favicon' : 'Select OG Image'}
          onSelect={(urls) => {
            const url = urls[0];
            if (mediaPickerType === 'favicon') updateMeta({ favicon: url });
            else if (mediaPickerType === 'ogImage') updateMeta({ ogImage: url });
          }}
          type={mediaPickerType ? "image" : "all"}
        />

        {/* Bottom Drawer for Page Settings */}
        <Drawer
          placement="bottom"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          zIndex={100}
          height="80%"
          styles={{
            body: {
              padding: 0,
              backgroundColor: '#0d0d14',
              height: '100%',
              overflowY: 'auto'
            },
            mask: {
              backdropFilter: 'blur(6px)',
              backgroundColor: 'rgba(0,0,0,0.6)'
            },
            wrapper: {
              backgroundColor: 'transparent',
            },
            section: {
              height: '100%',
              backgroundColor: '#0d0d14',
              borderTop: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset'
            },
            header: {
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '16px 24px',
              backgroundColor: '#0d0d14'
            }
          }}
          closeIcon={<span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>×</span>}
          title={<span style={{ color: 'rgba(165,163,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, fontSize: 11 }}>Page Settings &amp; Configuration</span>}
        >
          <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {/* Section 1: Page Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ color: 'rgba(165,163,255,0.6)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8, margin: 0 }}>Page Identity</h3>
              <DarkSettingField label="Page Title">
                <input
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  defaultValue={page?.title}
                  onBlur={(e) => updateTitle(e.target.value)}
                  placeholder="e.g. My Awesome Page"
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </DarkSettingField>
              <DarkSettingField label="URL Slug">
                <input
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  defaultValue={page?.slug}
                  onBlur={(e) => updateSlug(slugify(e.target.value))}
                  placeholder="page-slug"
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </DarkSettingField>

              {user && (
                <DarkSettingField label="Page Thumbnail">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {page?.thumbnail ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }} className="group">
                        <img src={page.thumbnail} alt="Thumbnail" style={{ width: '100%', height: 120, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => setShowCapturePicker(true)} style={{ padding: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 8, border: 'none', cursor: 'pointer' }}><ArrowsRightLeftIcon style={{ width: 18, height: 18, color: '#fff' }} /></button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: 120, borderRadius: 12, border: '2px dashed rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <CameraIcon style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.2)' }} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>No thumbnail set</span>
                      </div>
                    )}
                    <button
                      onClick={() => setShowCapturePicker(true)}
                      style={{ width: '100%', padding: '8px 0', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {page?.thumbnail ? 'Change Thumbnail' : 'Choose Thumbnail'}
                    </button>
                  </div>
                </DarkSettingField>
              )}
            </div>

            {/* Section 2: SEO & Branding */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ color: 'rgba(165,163,255,0.6)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8, margin: 0 }}>SEO &amp; Branding</h3>
              <DarkSettingField label="Meta Description">
                <textarea
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                  defaultValue={page?.meta?.description || ''}
                  onBlur={(e) => updateMeta({ description: e.target.value })}
                  rows={3}
                  placeholder="Brief description for search engines..."
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </DarkSettingField>

              <DarkSettingField label="Keywords">
                <input
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  defaultValue={page?.meta?.keywords || ''}
                  onBlur={(e) => updateMeta({ keywords: e.target.value })}
                  placeholder="e.g. blog, tech, design"
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </DarkSettingField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DarkSettingField label="Favicon">
                  <MediaPreview
                    url={page?.meta?.favicon}
                    onChoose={() => setMediaPickerType('favicon')}
                    onClear={() => updateMeta({ favicon: '' })}
                    label="Favicon"
                    allowRemove={false}
                  />
                </DarkSettingField>
                <DarkSettingField label="Social Preview (OG)">
                  <MediaPreview
                    url={page?.meta?.ogImage}
                    onChoose={() => setMediaPickerType('ogImage')}
                    onClear={() => updateMeta({ ogImage: '' })}
                    label="OG Image"
                    allowRemove={false}
                  />
                </DarkSettingField>
              </div>
            </div>

            {/* Section 3: Global Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ color: 'rgba(165,163,255,0.6)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8, margin: 0 }}>Global Configuration</h3>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.primary}55` }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>Primary Color</p>
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Site accent color</p>
                    </div>
                  </div>
                  <ColorPicker
                    value={colors.primary}
                    onChange={(v) => updateTheme({ colors: { ...colors, primary: v.toHexString() } })}
                    onOpenChange={(open) => {
                      if (!open) {
                        updateTheme({ colors: { ...colors, primary: colors.primary } }, true);
                        useEditorStore.getState().migrateThemeColors();
                      }
                    }}
                    size="small"
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 16, display: 'flex', gap: 12 }}>
                <div style={{ padding: 8, background: 'rgba(99,102,241,0.15)', borderRadius: 10, height: 'fit-content', flexShrink: 0 }}>
                  <ZapIcon style={{ width: 16, height: 16, color: '#818cf8' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>One-Click Sync</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>Instantly propagate theme changes across all page components.</p>
                  <button
                    onClick={() => useEditorStore.getState().migrateThemeColors()}
                    style={{ marginTop: 4, color: '#818cf8', fontSize: 10, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Sync Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      </header>
    </ConfigProvider>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function IconBtn({
  children, onClick, disabled, title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--text-subtle)" : "var(--text-muted)",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
    >
      {children}
    </button>
  );
}

function SettingField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function DarkSettingField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function MediaPreview({
  url,
  onChoose,
  onClear,
  label,
  allowRemove = true
}: {
  url?: string;
  onChoose: () => void;
  onClear: () => void;
  label: string;
  allowRemove?: boolean;
}) {
  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative group rounded-lg overflow-hidden border border-(--border) bg-(--surface) aspect-square flex items-center justify-center">
          <img src={url} alt={label} className="w-full h-full object-contain p-2" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={onChoose}
              className="p-1.5 bg-white/20 rounded-md hover:bg-white/30 transition-colors"
              title="Change"
            >
              <ArrowsRightLeftIcon className="w-4 h-4 text-white" />
            </button>
            {allowRemove && <button
              onClick={onClear}
              className="p-1.5 bg-red-500/40 rounded-md hover:bg-red-500/60 transition-colors"
              title="Remove"
            >
              <TrashIcon className="w-4 h-4 text-white" />
            </button>}
          </div>
        </div>
      ) : (
        <button
          onClick={onChoose}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-(--border) hover:border-(--primary) hover:bg-(--surface) transition-all flex flex-col items-center justify-center gap-1.5 text-(--text-subtle)"
        >
          <PhotoIcon className="w-5 h-5 opacity-40" />
          <span className="text-[10px] font-medium">Choose</span>
        </button>
      )}
    </div>
  );
}
