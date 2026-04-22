"use client";

import { useCallback, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCookie } from "@/lib/utils";
import { useCreatePage } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PageTransition } from "@/components/layout/PageTransition";
import NewPageWizard from "@/components/editor/NewPageWizard";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import { DeleteToastProvider } from "@/context/DeleteToastContext";

// ─── Map wizard section IDs → section template category prefixes ──────────────
const SECTION_ID_MAP: Record<string, string> = {
  header: "nav-",
  hero: "hero-",
  features: "features-",
  stats: "stats-",
  team: "team-",
  testimonials: "testimonials-",
  pricing: "pricing-",
  contact: "contact-",
  cta: "cta-",
  gallery: "gallery-",
  faq: "faq-",
  footer: "footer-",
};

// Pick the first matching template for each section ID, ensuring header is first and footer is last
function buildContentFromSections(sectionIds: string[]) {
  // Sort: header first, footer last, rest in selection order
  const sorted = [
    ...sectionIds.filter((id) => id === "header"),
    ...sectionIds.filter((id) => id !== "header" && id !== "footer"),
    ...sectionIds.filter((id) => id === "footer"),
  ];
  return sorted
    .map((id) => {
      const prefix = SECTION_ID_MAP[id];
      if (!prefix) return null;
      const template = SECTION_TEMPLATES.find((t) => t.id.startsWith(prefix));
      return template ? template.create() : null;
    })
    .filter(Boolean);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToasts();
  const router = useRouter();
  const pathname = usePathname();
  const createMutation = useCreatePage();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Client-side authentication guard
    // Only redirect if we are NOT loading, we have NO user, AND we don't even have a session cookie
    // This prevents premature redirection during state transitions.
    const hasSessionCookie = !!getCookie("hasSession");
    if (!authLoading && !user && !hasSessionCookie) {
        router.push("/?auth=login");
    }
  }, [authLoading, user, router]);

  const handleCreate = useCallback(() => {
    setWizardOpen(true);
  }, []);

  const handleWizardSubmit = useCallback(async (title: string, slug: string, selectedSections: string[]) => {
    try {
      const content = buildContentFromSections(selectedSections);
      const payload = {
        title,
        slug: slug || "page-" + Date.now().toString().slice(-4),
        status: "DRAFT",
        isPublic: false,
        visibility: 'PUBLIC',
        content,
        meta: {}
      };
      const res = await createMutation.mutateAsync(payload) as any;
      success("Project created!");
      setWizardOpen(false);
      router.push(`/editor/${res.data.page._id}`);
    } catch {
      toastError("Failed to create project");
    }
  }, [createMutation, router, success, toastError]);

  if (!mounted || authLoading) {
    return (
      <div className="dashboard-dark h-screen flex items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-indigo-400/40" />
      </div>
    );
  }

  return (
    <DeleteToastProvider>
      <div className="dashboard-dark min-h-screen selection:bg-indigo-500/30">
        <DashboardHeader onCreatePage={handleCreate} />

        <main className="relative">
          <PageTransition pathname={pathname}>
            {children}
          </PageTransition>
        </main>

        {/* Persistent mobile navigation spacer */}
        <div className="h-16 lg:hidden shrink-0" />

        <NewPageWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSubmit={handleWizardSubmit}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </DeleteToastProvider>
  );
}
