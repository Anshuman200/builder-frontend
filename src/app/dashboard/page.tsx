"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, FileText, Globe, Clock, MoreHorizontal,
  Copy, Trash2, ExternalLink, Edit3, Zap, LogOut, User,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { pagesApi } from "@/lib/api/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await pagesApi.list();
      setPages(data.pages ?? data ?? []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    fetchPages();
  }, [user, router, fetchPages]);

  const createPage = async () => {
    const title = newPageTitle.trim() || "Untitled Page";
    setCreating(true);
    try {
      const { data } = await pagesApi.create({ title });
      const id = data.page?.id ?? data.id;
      router.push(`/editor/${id}`);
    } catch {
      setCreating(false);
      setShowNewPageInput(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    await pagesApi.delete(id);
    setPages(p => p.filter(pg => pg.id !== id));
  };

  const duplicatePage = async (id: string) => {
    const { data } = await pagesApi.duplicate(id);
    setPages(p => [...p, data.page ?? data]);
    setMenuOpenId(null);
  };

  const togglePublish = async (page: Page) => {
    if (page.status === "PUBLISHED") {
      await pagesApi.unpublish(page.id);
      setPages(p => p.map(pg => pg.id === page.id ? { ...pg, status: "DRAFT" } : pg));
    } else {
      await pagesApi.publish(page.id);
      setPages(p => p.map(pg => pg.id === page.id ? { ...pg, status: "PUBLISHED" } : pg));
    }
    setMenuOpenId(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 220,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)" }}>PageCraft</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
          <SidebarItem icon={<LayoutDashboard size={16} />} label="Pages" active />
        </nav>

        {/* User area */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "0.5rem 0.625rem", borderRadius: "var(--radius)",
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text)", transition: "background var(--transition)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <User size={14} color="white" />
              </div>
              <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.plan}
                </div>
              </div>
            </button>

            {userMenuOpen && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden", zIndex: 100,
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", padding: "0.625rem 0.875rem",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--danger)", fontSize: "0.8rem", fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <header style={{
          height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>My Pages</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ThemeToggle />
            <button
              onClick={() => setShowNewPageInput(true)}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.45rem 1rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", border: "none", borderRadius: "var(--radius)",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
              }}
            >
              <Plus size={15} /> New page
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "1.75rem 1.5rem" }}>
          {/* New page input */}
          {showNewPageInput && (
            <div style={{
              marginBottom: "1.5rem",
              padding: "1.25rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              display: "flex", gap: "0.75rem", alignItems: "center",
            }}>
              <input
                autoFocus
                type="text"
                value={newPageTitle}
                onChange={e => setNewPageTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createPage(); if (e.key === "Escape") setShowNewPageInput(false); }}
                placeholder="Page title (e.g. My Landing Page)"
                style={{
                  flex: 1, padding: "0.6rem 0.875rem",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                  color: "var(--text)", fontSize: "0.875rem",
                  outline: "none",
                }}
              />
              <button
                onClick={createPage}
                disabled={creating}
                style={{
                  padding: "0.6rem 1.25rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", border: "none", borderRadius: "var(--radius)",
                  fontWeight: 600, fontSize: "0.85rem",
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => setShowNewPageInput(false)}
                style={{
                  padding: "0.6rem 0.875rem",
                  background: "var(--surface-hover)", color: "var(--text-muted)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {loading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 180, borderRadius: "var(--radius-lg)",
                  background: "var(--surface)",
                  animation: "pulse 2s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <EmptyState onCreate={() => setShowNewPageInput(true)} />
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {pages.map(page => (
                <PageCard
                  key={page.id}
                  page={page}
                  menuOpen={menuOpenId === page.id}
                  onMenuToggle={(id) => setMenuOpenId(prev => prev === id ? null : id)}
                  onEdit={() => router.push(`/editor/${page.id}`)}
                  onDuplicate={() => duplicatePage(page.id)}
                  onDelete={() => deletePage(page.id)}
                  onTogglePublish={() => togglePublish(page)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Close menus on outside click */}
      {(menuOpenId || userMenuOpen) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 30 }}
          onClick={() => { setMenuOpenId(null); setUserMenuOpen(false); }}
        />
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.625rem",
      padding: "0.5rem 0.625rem", borderRadius: "var(--radius)",
      background: active ? "var(--primary-light)" : "transparent",
      color: active ? "var(--primary)" : "var(--text-muted)",
      fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
    }}>
      {icon}
      {label}
    </div>
  );
}

function PageCard({
  page, menuOpen, onMenuToggle, onEdit, onDuplicate, onDelete, onTogglePublish,
}: {
  page: Page;
  menuOpen: boolean;
  onMenuToggle: (id: string) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const isPublished = page.status === "PUBLISHED";

  return (
    <div style={{
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      transition: "box-shadow var(--transition), border-color var(--transition)",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Preview */}
      <div
        onClick={onEdit}
        style={{
          height: 130,
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          opacity: 0.4,
        }}>
          <FileText size={32} color="var(--text-muted)" />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Click to edit
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "0.875rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <h3 style={{
              fontSize: "0.9rem", fontWeight: 700, color: "var(--text)",
              margin: "0 0 0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {page.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <StatusBadge status={page.status} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Clock size={11} />
                {new Date(page.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onMenuToggle(page.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: "0.25rem",
                borderRadius: "var(--radius-sm)", display: "flex",
              }}
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                minWidth: 160,
                zIndex: 100,
                overflow: "hidden",
              }}>
                <MenuAction icon={<Edit3 size={13} />} label="Edit" onClick={onEdit} />
                <MenuAction
                  icon={isPublished ? <Globe size={13} /> : <Globe size={13} />}
                  label={isPublished ? "Unpublish" : "Publish"}
                  onClick={onTogglePublish}
                />
                {isPublished && (
                  <MenuAction
                    icon={<ExternalLink size={13} />}
                    label="View live"
                    onClick={() => window.open(`/${page.slug}`, "_blank")}
                  />
                )}
                <MenuAction icon={<Copy size={13} />} label="Duplicate" onClick={onDuplicate} />
                <div style={{ height: 1, background: "var(--border)", margin: "0.25rem 0" }} />
                <MenuAction icon={<Trash2 size={13} />} label="Delete" onClick={onDelete} danger />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Page["status"] }) {
  const config = {
    PUBLISHED: { bg: "rgba(16,185,129,0.1)", color: "#10b981", dot: "#10b981", label: "Published" },
    DRAFT: { bg: "rgba(100,116,139,0.1)", color: "var(--text-muted)", dot: "var(--text-subtle)", label: "Draft" },
    ARCHIVED: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", dot: "#f59e0b", label: "Archived" },
  }[status];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.15rem 0.5rem",
      background: config.bg, color: config.color,
      borderRadius: "var(--radius-full)",
      fontSize: "0.7rem", fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: config.dot }} />
      {config.label}
    </span>
  );
}

function MenuAction({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.5rem 0.75rem",
        background: "transparent", border: "none", cursor: "pointer",
        color: danger ? "var(--danger)" : "var(--text)",
        fontSize: "0.8rem", fontWeight: 500, textAlign: "left",
        transition: "background var(--transition)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {icon} {label}
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "5rem 1rem", textAlign: "center", gap: "1rem",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "var(--radius-xl)",
        background: "var(--primary-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FileText size={32} color="var(--primary)" />
      </div>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
          No pages yet
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
          Create your first page and start building something great.
        </p>
      </div>
      <button
        onClick={onCreate}
        style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.6rem 1.25rem",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white", border: "none", borderRadius: "var(--radius)",
          fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
        }}
      >
        <Plus size={16} /> Create your first page
      </button>
    </div>
  );
}
