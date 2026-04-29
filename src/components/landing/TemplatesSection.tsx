import { pagesApi } from "@/lib/api/client";
import { CacheBox } from "@/components/common/CacheBox";
import { TemplatesSectionClient } from "./TemplatesSectionClient";
import { Suspense } from "react";
import { CommonContainer } from "@/components/layout/CommonContainer";

/**
 * A curated section for the landing page showcasing top community templates.
 * Leveraging modern Server-Side Caching (CacheBox) for instant delivery.
 */
export function TemplatesSection() {
    return (
        <Suspense fallback={<TemplatesSectionSkeleton />}>
            <TemplatesDataWrapper />
        </Suspense>
    );
}

/**
 * Data fetcher wrapper using the reusable CacheBox component....
 * Granularly caches the Community Templates query on the server.
 */
async function TemplatesDataWrapper() {
    return (
        <CacheBox profile="STANDARD" tags={["community-templates"]}>
            <TemplatesDataFetcher />
        </CacheBox>
    );
}

async function TemplatesDataFetcher() {
    // Explicitly call the API on the server
    try {
        const { data: responseData } = await pagesApi.templates({ limit: 8 });
        console.log('responseData', responseData)
        // Correctly handle the new standardized { data: { templates: [...] } } structure
        const templates = Array.isArray(responseData)
            ? responseData
            : responseData?.templates ?? [];

        if (!templates || templates.length === 0) return null;

        return <TemplatesSectionClient templates={templates} />;
    } catch (e) {
        console.error("Templates fetch failed", e);
        return null;
    }
}

/**
 * High-fidelity Skeleton for seamless initial loading.
 */
function TemplatesSectionSkeleton() {
    return (
        <section className="py-24 px-6 bg-[#09090b]">
            <CommonContainer>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="h-10 w-64 bg-white/5 rounded-xl mb-6 animate-pulse" />
                        <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-[280px] bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </CommonContainer>
        </section>
    );
}
