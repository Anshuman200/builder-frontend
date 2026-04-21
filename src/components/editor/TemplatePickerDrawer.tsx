"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useInfinitePublicTemplates } from "@/lib/api/queries";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CATEGORIES } from "@/lib/constants/templates";
import { Modal, Spin } from "antd";
import { pagesApi } from "@/lib/api/client";
import { useToasts } from "@/hooks/useToasts";
import { LibraryHeader } from "./PalettePanels";

export function TemplatePickerDrawer() {
  const { templatePicker, closeTemplatePicker, applyTemplate } = useEditorStore();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [isApplying, setIsApplying] = React.useState(false);
  const { success, error } = useToasts();

  const [shouldRender, setShouldRender] = React.useState(templatePicker.open);

  // Handle mounting/unmounting with animation delay
  React.useEffect(() => {
    if (templatePicker.open) {
      setShouldRender(true);
    } else if (shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [templatePicker.open, shouldRender]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfinitePublicTemplates({
    search,
    category: category === "All" ? "" : category,
    limit: 12
  });

  const templates = data?.pages.flatMap(page => page.templates) || [];

  if (!shouldRender) return null;

  const handleSelect = (template: any) => {
    closeTemplatePicker();
    Modal.confirm({
      title: "Replace Current Page?",
      content: "This will permanently delete all existing blocks on this page and replace them with the selected template. This action can be undone via Cmd+Z.",
      okText: "Replace Content",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        closeTemplatePicker();
        setIsApplying(true);
        try {
          const { data: fullTemplate } = await pagesApi.get(template._id);
          if (fullTemplate && fullTemplate.content) {
            // Filter out header and footer blocks as requested
            const filteredContent = fullTemplate.content.filter((b: any) => b.type !== 'header' && b.type !== 'footer');

            applyTemplate(filteredContent, fullTemplate.theme);
            success("Template applied successfully!");
          } else {
            throw new Error("Invalid template data");
          }
        } catch (err: any) {
          error(err.message || "Failed to load template");
        } finally {
          setIsApplying(false);
        }
      }
    });
  };

  const isOpening = templatePicker.open;

  return (
    <div
      className="dark"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: "none"
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      {/* Backdrop Overlay */}
      <div
        onClick={closeTemplatePicker}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          animation: `${isOpening ? "fadeIn" : "fadeOut"} 0.4s forwards`,
          pointerEvents: "auto",
          cursor: "default"
        }}
      />

      {/* Actual Drawer */}
      <div
        style={{
          position: "relative",
          height: "85vh",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.15) inset",
          display: "flex",
          flexDirection: "column",
          animation: `${isOpening ? "slideUp" : "slideDown"} 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards`,
          backdropFilter: "blur(60px) saturate(200%)",
          WebkitBackdropFilter: "blur(60px) saturate(200%)",
          pointerEvents: "auto",
          color: "#ededed"
        }}
      >
        {/* Header */}
        <LibraryHeader
          title="Choose a Template"
          search={search}
          setSearch={setSearch}
          placeholder="Search templates..."
          onClose={closeTemplatePicker}
        >
          <div className="no-scrollbar" style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            whiteSpace: "nowrap",
            padding: "4px 24px 8px", // Added horizontal padding for mobile breathing room
            minWidth: 0,
            maxWidth: "100%",
            justifyContent: "flex-start" // Changed to flex-start to prevent hiding first items on overflow
          }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 99,
                  background: category === cat ? "var(--primary)" : "var(--surface)",
                  color: category === cat ? "#fff" : "var(--text-muted)",
                  border: category === cat ? "none" : "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={e => { if (category !== cat) e.currentTarget.style.borderColor = "var(--primary-light)"; }}
                onMouseLeave={e => { if (category !== cat) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                {cat}
              </button>
            ))}
          </div>
        </LibraryHeader>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px 48px" }}>
          {status === "pending" ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spin size="large" />
            </div>
          ) : templates.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No templates found matching your criteria</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 32,
              paddingBottom: 40
            }}>
              {templates.map((template, idx) => (
                <div key={template._id} style={{ position: "relative" }}>
                  <TemplateCard
                    template={template}
                    onClick={() => handleSelect(template)}
                    index={idx}
                    useMotion
                    variant="public"
                  />
                </div>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                style={{
                  padding: "10px 24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--text)",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {isFetchingNextPage ? "Loading more..." : "Load More Templates"}
              </button>
            </div>
          )}
        </div>

        {/* Applying Overlay */}
        {isApplying && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff"
          }}>
            <Spin size="large" style={{ marginBottom: 16 }} />
            <p style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.05em" }}>APPLYING TEMPLATE...</p>
          </div>
        )}
      </div>
    </div>
  );
}
