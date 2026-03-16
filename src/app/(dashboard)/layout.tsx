"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PageTransition } from "@/components/layout/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();
  const pathname = usePathname();
  const createMutation = useCreatePage();

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

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950 text-white/20">
        <ArrowPathIcon className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <DashboardHeader onCreatePage={handleCreate} />
      
      <main className="relative">
        <PageTransition pathname={pathname}>
          {children}
        </PageTransition>
      </main>

      {/* Persistent mobile navigation spacer */}
      <div className="h-16 lg:hidden shrink-0" />
    </div>
  );
}
