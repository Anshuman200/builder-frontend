"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import {
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { CommonContainer } from "@/components/layout/CommonContainer";
import MediaLibraryView from "@/components/media/MediaLibraryView";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function MediaPage() {
  const { isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();

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
      <DashboardHeader
        onCreatePage={handleCreate}
      />

      <CommonContainer className="pt-20 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white italic mb-4">Media Library</h2>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-base font-medium leading-relaxed">Manage assets and uploads across your entire collection</p>
          </div>
        </div>

        <MediaLibraryView />
      </CommonContainer>
    </div>
  );
}
