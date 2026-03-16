"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import { CommonContainer } from "@/components/layout/CommonContainer";
import MediaLibraryView from "@/components/media/MediaLibraryView";

export default function MediaPage() {
  return (
      <CommonContainer className="pt-5 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white italic mb-4">Media Library</h2>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-base font-medium leading-relaxed">Manage assets and uploads across your entire collection</p>
          </div>
        </div>

        <MediaLibraryView />
      </CommonContainer>
  );
}
