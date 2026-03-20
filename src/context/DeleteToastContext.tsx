"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeleteItem = {
  id: string;
  label: string;
};

type BatchStatus = "pending" | "running" | "done" | "partial" | "error";

type DeleteBatch = {
  /** Unique identifier for this batch operation */
  batchId: string;
  items: DeleteItem[];
  completed: number;
  failed: number;
  status: BatchStatus;
  error?: string;
};

type DeleteToastContextType = {
  /**
   * Start a background delete operation.
   * Pass an array of items and a `deleteFn` that resolves/rejects per item.
   * Returns the batchId so the caller can reference it later (rarely needed).
   */
  startDelete: (
    items: DeleteItem[],
    deleteFn: (item: DeleteItem) => Promise<void>,
    opts?: { onComplete?: (batch: DeleteBatch) => void }
  ) => string;
  /** If you need to dismiss the toast programmatically */
  dismiss: (batchId: string) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const DeleteToastContext = createContext<DeleteToastContextType | null>(null);

export function useDeleteToast() {
  const ctx = useContext(DeleteToastContext);
  if (!ctx) throw new Error("useDeleteToast must be used inside <DeleteToastProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DeleteToastProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<DeleteBatch[]>([]);
  const batchCounter = useRef(0);

  const updateBatch = useCallback((batchId: string, patch: Partial<DeleteBatch>) => {
    setBatches(prev => prev.map(b => b.batchId === batchId ? { ...b, ...patch } : b));
  }, []);

  const startDelete = useCallback(
    (
      items: DeleteItem[],
      deleteFn: (item: DeleteItem) => Promise<void>,
      opts?: { onComplete?: (batch: DeleteBatch) => void }
    ): string => {
      const batchId = `del-${++batchCounter.current}-${Date.now()}`;
      const initial: DeleteBatch = {
        batchId,
        items,
        completed: 0,
        failed: 0,
        status: "running",
      };
      setBatches(prev => [...prev, initial]);

      // Run all deletes sequentially to avoid rate-limiting issues
      (async () => {
        let completed = 0;
        let failed = 0;
        let lastError: string | undefined;

        for (const item of items) {
          try {
            await deleteFn(item);
            completed++;
          } catch (err: any) {
            failed++;
            lastError = err?.message || "Failed";
          }
          // Update progress after each item
          setBatches(prev =>
            prev.map(b =>
              b.batchId === batchId
                ? { ...b, completed, failed }
                : b
            )
          );
        }

        const finalStatus: BatchStatus =
          failed === 0 ? "done" :
          completed === 0 ? "error" :
          "partial";

        const finalBatch: DeleteBatch = {
          batchId,
          items,
          completed,
          failed,
          status: finalStatus,
          error: lastError,
        };

        setBatches(prev => prev.map(b => b.batchId === batchId ? finalBatch : b));
        opts?.onComplete?.(finalBatch);

        // Auto-dismiss success/partial after 5s, keep errors around
        if (finalStatus === "done" || finalStatus === "partial") {
          setTimeout(() => {
            setBatches(prev => prev.filter(b => b.batchId !== batchId));
          }, 5000);
        }
      })();

      return batchId;
    },
    [updateBatch]
  );

  const dismiss = useCallback((batchId: string) => {
    setBatches(prev => prev.filter(b => b.batchId !== batchId));
  }, []);

  return (
    <DeleteToastContext.Provider value={{ startDelete, dismiss }}>
      {children}
      <GlobalDeleteToast batches={batches} onDismiss={dismiss} />
    </DeleteToastContext.Provider>
  );
}

// ─── Floating Toast UI ────────────────────────────────────────────────────────

function GlobalDeleteToast({
  batches,
  onDismiss,
}: {
  batches: DeleteBatch[];
  onDismiss: (batchId: string) => void;
}) {
  if (batches.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes delete-toast-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {batches.map(batch => (
        <DeleteToastCard key={batch.batchId} batch={batch} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function DeleteToastCard({
  batch,
  onDismiss,
}: {
  batch: DeleteBatch;
  onDismiss: (batchId: string) => void;
}) {
  const { batchId, items, completed, failed, status } = batch;
  const total = items.length;
  const isBatch = total > 1;
  const itemLabel = total === 1 ? items[0].label : `${total} items`;
  const progress = completed + failed;

  const borderColor =
    status === "error" ? "rgba(239,68,68,0.5)" :
    status === "partial" ? "rgba(251,191,36,0.5)" :
    status === "done" ? "rgba(16,185,129,0.4)" :
    "rgba(255,255,255,0.12)";

  const icon =
    status === "running" ? "⏳" :
    status === "done" ? "✅" :
    status === "partial" ? "⚠️" :
    "❌";

  const headline =
    status === "running"
      ? isBatch
        ? `Deleting ${progress}/${total}…`
        : `Deleting ${itemLabel}…`
      : status === "done"
      ? isBatch
        ? `Deleted ${completed}/${total} items`
        : `${itemLabel} deleted`
      : status === "partial"
      ? `${completed}/${total} deleted, ${failed} failed`
      : isBatch
      ? `Failed to delete ${itemLabel}`
      : `Failed to delete ${itemLabel}`;

  const subtext =
    status === "running"
      ? "You can continue using the app"
      : status === "partial" || status === "error"
      ? batch.error
      : null;

  return (
    <div
      style={{
        minWidth: 320,
        maxWidth: 500,
        background: "#1a1a1a",
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        padding: "13px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "delete-toast-in 0.25s ease",
        pointerEvents: "auto",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>
        {status === "running" ? (
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              border: "2px solid #818cf8",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : icon}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, lineHeight: 1.35 }}>
          {headline}
        </div>
        {subtext && (
          <div
            style={{
              color: status === "running" ? "#9ca3af" : "#fca5a5",
              fontSize: 11,
              marginTop: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtext}
          </div>
        )}

        {/* Progress bar for batch */}
        {isBatch && status === "running" && (
          <div
            style={{
              marginTop: 6,
              height: 3,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(progress / total) * 100}%`,
                background: "#818cf8",
                borderRadius: 99,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(batchId)}
        style={{
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: "2px 4px",
          borderRadius: 4,
          flexShrink: 0,
        }}
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
