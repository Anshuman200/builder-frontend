"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// /editor — creates a new page and redirects to /editor/[id]
export default function NewEditorPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a local temporary ID for guest mode
    // In a real app, this ensures the editor opens instantly while we sync in the background
    const localId = `${Math.random().toString(36).substring(2, 9)}`;
    router.replace(`/editor/${localId}`);
  }, [router]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", flexDirection: "column", gap: "1rem",
      color: "var(--text-muted)",
    }}>
      <ArrowPathIcon style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: "0.9rem", margin: 0 }}>Creating your page…</p>
    </div>
  );
}
