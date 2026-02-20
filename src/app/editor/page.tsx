"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pagesApi } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

// /editor — creates a new page and redirects to /editor/[id]
export default function NewEditorPage() {
  const router = useRouter();

  useEffect(() => {
    pagesApi.create({ title: "Untitled Page" })
      .then(({ data }) => {
        const id = data.page?.id ?? data.id;
        router.replace(`/editor/${id}`);
      })
      .catch(() => {
        router.replace("/dashboard");
      });
  }, [router]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", flexDirection: "column", gap: "1rem",
      color: "var(--text-muted)",
    }}>
      <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: "0.9rem", margin: 0 }}>Creating your page…</p>
    </div>
  );
}
