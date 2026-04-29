"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Template } from "@/types/templates";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CommonContainer } from "@/components/layout/CommonContainer";

interface TemplatesSectionClientProps {
    templates: Template[];
}

/**
 * Presentational layer for the Community Templates section.
 * Receives cached template data from the parent Server Component.
 */
export function TemplatesSectionClient({ templates }: TemplatesSectionClientProps) {
    const router = useRouter();

    if (!templates || templates.length === 0) return null;
    console.log('TemplatesSectionClient templates >>>> ', templates)

    return (
        <section className="py-24 px-6 bg-[#09090b]">
            <CommonContainer>
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight italic">
                            Community Templates
                        </h2>
                        <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                            Kickstart your next project with one of our beautifully designed templates,
                            crafted by our global community of creators.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/explore")}
                        className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white font-bold transition-all hover:bg-white/10 hover:border-indigo-500/30 hover:scale-105 active:scale-95"
                    >
                        View All <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Templates Grid - Standardized count for curated feel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {templates.slice(0, 8).map((template: Template) => (
                        <TemplateCard
                            key={template._id}
                            template={template}
                            onClick={() => router.push(`/editor/${template._id}`)}
                        />
                    ))}
                </div>
            </CommonContainer>
        </section>
    );
}
