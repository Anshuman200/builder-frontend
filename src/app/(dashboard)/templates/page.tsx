"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTemplates, useCreatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import {
  ArrowPathIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/ui/SearchInput";
import { CommonContainer } from "@/components/layout/CommonContainer";
import { TemplateCard } from "@/components/templates/TemplateCard";

export default function TemplatesPage() {
  const { isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();

  const { data: templates = [], isLoading: loading } = useTemplates();
  const [search, setSearch] = useState("");

  if (loading && templates.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  const filtered = templates.filter((p: any) => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <CommonContainer className="pt-5 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white italic mb-4">Templates</h2>
          <p className="text-white/40 text-[10px] sm:text-xs md:text-base font-medium leading-relaxed">Start with a professional, high-converting foundation</p>
        </div>

        <div className="">
          <SearchInput
            placeholder="Search templates..."
            value={search}
            onChange={v => setSearch(v)}
            className="w-full md:w-72"
            containerStyle={{ background: "rgba(255,255,255,0.05)", borderRadius: 16 }}
            style={{ height: 44, border: "none" }}
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
  );
}
