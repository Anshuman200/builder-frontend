"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTemplates, useCreatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Dropdown } from "antd";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { EyeIcon } from "@heroicons/react/24/outline";

export default function TemplatesPage() {
  const { isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();

  const { data: templates = [], isLoading: loading } = useTemplates();
  const createMutation = useCreatePage();

  const [search, setSearch] = useState("");

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

  if (authLoading || (loading && templates.length === 0)) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950 text-white/20">
        <ArrowPathIcon className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  const filtered = templates.filter((p: any) => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <DashboardHeader 
        onCreatePage={handleCreate} 
      />

      <CommonContainer className="pt-20 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
            <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white italic mb-4">Templates</h2>
                <p className="text-white/40 text-[10px] sm:text-xs md:text-base font-medium leading-relaxed">Start with a professional, high-converting foundation</p>
            </div>

            <div className="w-full md:w-72 bg-white/5 rounded-2xl px-4 flex items-center gap-3 border border-white/5 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all group shrink-0">
              <MagnifyingGlassIcon className="w-4 h-4 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
              <input
                placeholder="Search templates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-white placeholder:text-white/20"
              />
            </div>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/2 rounded-[2.5rem] border border-dashed border-white/10 text-center mt-6">
            <h3 className="text-xl font-black text-white mb-2">No templates found</h3>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">Check back later for new inspiration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((p: any) => (
              <TemplateCard
                key={p._id}
                template={p}
                variant="dashboard"
                onClick={() => router.push(`/editor/${p._id}`)}
                actions={
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`/preview/${p._id}`, "_blank"); }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all bg-transparent border-none cursor-pointer"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                }
              />
            ))}
          </div>
        )}
      </CommonContainer>
    </div>
  );
}
