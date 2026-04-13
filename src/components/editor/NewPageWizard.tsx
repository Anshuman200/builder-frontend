"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CheckIcon,
  ChevronLeftIcon,
  XMarkIcon,
  BoltIcon,
  PlusIcon,
  LockClosedIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// ─── Section definitions shown in Step 2  ─────────────────────────────────────

interface SectionType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  blockType: string;
}

const WIZARD_SECTIONS: SectionType[] = [
  {
    id: "header",
    label: "Header",
    description: "Navigation bar with logo and menu",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <rect x="2" y="5" width="20" height="4" rx="1" />
        <rect x="2" y="11" width="9" height="8" rx="1" />
        <rect x="13" y="11" width="9" height="8" rx="1" />
      </svg>
    ),
    iconBg: "from-blue-500/20 to-blue-600/10",
    blockType: "navigation",
  },
  {
    id: "hero",
    label: "Hero Section",
    description: "Eye-catching banner with headline and CTA",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
      </svg>
    ),
    iconBg: "from-purple-500/20 to-purple-600/10",
    blockType: "hero",
  },
  {
    id: "features",
    label: "Features",
    description: "Showcase your key features and benefits",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M9 12l2 2 4-4" />
        <path d="M5 7h14M5 12h4M5 17h14" />
      </svg>
    ),
    iconBg: "from-green-500/20 to-green-600/10",
    blockType: "features",
  },
  {
    id: "stats",
    label: "Stats Strip",
    description: "Display impressive statistics and metrics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M3 19V9l4-4 4 4 4-6 4 3" />
        <line x1="3" y1="19" x2="21" y2="19" />
      </svg>
    ),
    iconBg: "from-amber-500/20 to-amber-600/10",
    blockType: "stats",
  },
  {
    id: "team",
    label: "Team Section",
    description: "Introduce your respective team members",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <circle cx="9" cy="7" r="3" />
        <circle cx="15" cy="7" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" />
      </svg>
    ),
    iconBg: "from-teal-500/20 to-teal-600/10",
    blockType: "team",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Customer reviews and social proof",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    iconBg: "from-pink-500/20 to-pink-600/10",
    blockType: "testimonials",
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Pricing tables and plans",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 8.5a2.5 2.5 0 10-5 .5c0 2 5 3 5 5a2.5 2.5 0 01-5 .5" />
        <line x1="12" y1="6" x2="12" y2="8" />
        <line x1="12" y1="16" x2="12" y2="18" />
      </svg>
    ),
    iconBg: "from-yellow-500/20 to-yellow-600/10",
    blockType: "pricing",
  },
  {
    id: "contact",
    label: "Contact Us",
    description: "Contact form and information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    iconBg: "from-indigo-500/20 to-indigo-600/10",
    blockType: "contact",
  },
  {
    id: "cta",
    label: "Call to Action",
    description: "Compelling CTA section",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    iconBg: "from-red-500/20 to-red-600/10",
    blockType: "cta",
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Showcase your work and portfolio",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
    iconBg: "from-sky-500/20 to-sky-600/10",
    blockType: "gallery",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Frequently asked questions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
    ),
    iconBg: "from-orange-500/20 to-orange-600/10",
    blockType: "faq",
  },
  {
    id: "footer",
    label: "Footer",
    description: "Footer with links and copyright",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <rect x="2" y="15" width="20" height="4" rx="1" />
        <line x1="6" y1="11" x2="6" y2="15" />
        <line x1="10" y1="9" x2="10" y2="15" />
        <line x1="14" y1="11" x2="14" y2="15" />
        <line x1="18" y1="9" x2="18" y2="15" />
      </svg>
    ),
    iconBg: "from-slate-500/20 to-slate-600/10",
    blockType: "footer",
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface NewPageWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, slug: string, selectedSections: string[], visibility: 'PUBLIC' | 'PRIVATE', password?: string) => Promise<void>;
  isSubmitting?: boolean;
  closable?: boolean;
}

// ─── Stepper Bar ─────────────────────────────────────────────────────────────

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${step >= 1 ? "bg-indigo-500 border-indigo-500 text-white" : "border-white/20 text-white/30"}`}>
          {step > 1 ? <CheckIcon className="w-4 h-4" /> : "1"}
        </div>
        <span className={`text-xs font-black uppercase tracking-widest transition-all ${step === 1 ? "text-white" : "text-white/40"}`}>Basic Info</span>
      </div>

      {/* Connector */}
      <div className="w-24 h-px mx-4 relative">
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        <div className={`absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-500 ${step > 1 ? "right-0" : "right-full"}`} />
      </div>

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${step >= 2 ? "bg-indigo-500 border-indigo-500 text-white" : "border-white/20 text-white/30"}`}>
          {step > 2 ? <CheckIcon className="w-4 h-4" /> : "2"}
        </div>
        <span className={`text-xs font-black uppercase tracking-widest transition-all ${step === 2 ? "text-white" : "text-white/40"}`}>Select Sections</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NewPageWizard({ open, onClose, onSubmit, isSubmitting = false, closable = true }: NewPageWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(["header", "hero", "footer"]);
  const [titleError, setTitleError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleClose = useCallback(() => {
    if (!closable) return;
    setStep(1);
    setTitle("");
    setSlug("");
    setSlugManual(false);
    setVisibility('PUBLIC');
    setPassword("");
    setShowPassword(false);
    setSelectedSections(["header", "hero", "footer"]);
    setTitleError("");
    setPasswordError("");
    onClose();
  }, [closable, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && closable) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, closable, handleClose]);

  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(slugify(val));
    if (val.trim()) setTitleError("");
  };

  const handleSlugChange = (val: string) => {
    setSlug(slugify(val));
    setSlugManual(true);
  };

  const toggleSection = useCallback((id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleNext = () => {
    if (!title.trim()) { setTitleError("Page name is required"); return; }
    if (visibility === 'PRIVATE' && !password.trim()) { setPasswordError("Password is required for private pages"); return; }
    setStep(2);
  };

  const handleFinish = async () => {
    const finalSlug = slug || slugify(title) || `page-${Date.now().toString().slice(-4)}`;
    await onSubmit(title.trim(), finalSlug, selectedSections, visibility, visibility === 'PRIVATE' ? password : undefined);
  };



  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes wizard-in { from{opacity:0;transform:scale(0.96) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes wizard-bg { from{opacity:0} to{opacity:1} }
        @keyframes slide-left { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center p-4 transition-all"
        style={{ 
          background: "rgba(0,0,0,0.75)", 
          backdropFilter: "blur(16px)", 
          WebkitBackdropFilter: "blur(16px)", 
          animation: "wizard-bg 0.3s ease" 
        }}
        onClick={(e) => { 
          if (e.target === e.currentTarget && closable) handleClose(); 
        }}
      >
        {/* Modal card */}
        <div
          className="relative w-full bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col"
          style={{ maxWidth: 680, maxHeight: "90dvh", animation: "wizard-in 0.3s cubic-bezier(0.34,1.4,0.64,1)" }}
        >
          {/* Gradient accent top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/60 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">Create New Page</h2>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {step === 1 ? "Name your page" : "Choose sections to pre-fill"}
                </p>
              </div>
            </div>
            {closable && (
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step bar */}
          <div className="px-6 pb-2 shrink-0">
            <StepBar step={step} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">

            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
              <div style={{ animation: "slide-left 0.25s ease" }} className="flex flex-col gap-5">
                <div className="p-5 bg-white/3 rounded-2xl border border-white/5">
                  <label className="block text-xs font-black text-white/50 uppercase tracking-widest mb-2">Page Name *</label>
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. SaaS Landing Page"
                    className={`w-full bg-transparent text-xl font-black text-white placeholder:text-white/15 border-none outline-none resize-none leading-snug py-1 ${titleError ? "placeholder:text-red-400/50" : ""}`}
                  />
                  {titleError && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">{titleError}</p>
                  )}
                </div>

                <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                  <label className="block text-xs font-black text-white/50 uppercase tracking-widest mb-2">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/20 font-mono shrink-0">/</span>
                    <input
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="auto-generated"
                      className="flex-1 bg-transparent text-sm font-mono text-white/60 placeholder:text-white/15 border-none outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                  <label className="block text-xs font-black text-white/50 uppercase tracking-widest mb-3">Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVisibility('PUBLIC')}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${visibility === 'PUBLIC' ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-white/3 border-white/5 text-white/40 hover:bg-white/5'}`}
                    >
                      <GlobeAltIcon className={`w-5 h-5 ${visibility === 'PUBLIC' ? 'text-indigo-400' : ''}`} />
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-wider leading-none">Public</p>
                        <p className="text-[9px] font-medium opacity-50 mt-1">Open for everyone</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setVisibility('PRIVATE')}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${visibility === 'PRIVATE' ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-white/3 border-white/5 text-white/40 hover:bg-white/5'}`}
                    >
                      <LockClosedIcon className={`w-5 h-5 ${visibility === 'PRIVATE' ? 'text-indigo-400' : ''}`} />
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-wider leading-none">Private</p>
                        <p className="text-[9px] font-medium opacity-50 mt-1">Password protected</p>
                      </div>
                    </button>
                  </div>
                </div>

                {visibility === 'PRIVATE' && (
                  <div className="p-4 bg-white/3 rounded-2xl border border-white/5" style={{ animation: "slide-left 0.2s ease" }}>
                    <label className="block text-xs font-black text-white/50 uppercase tracking-widest mb-2">Set Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                        placeholder="Choose a strong password"
                        className="w-full bg-transparent text-sm font-bold text-white placeholder:text-white/10 border-none outline-none pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">{passwordError}</p>
                    )}
                  </div>
                )}

                <div className="px-1">
                  <p className="text-white/25 text-[10px] font-medium leading-relaxed uppercase tracking-wider">
                    {visibility === 'PUBLIC'
                      ? "Anyone with the link can view your beautiful page."
                      : "Only visitors with the correct password can access the content."}
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 2: Select Sections ── */}
            {step === 2 && (
              <div style={{ animation: "slide-left 0.25s ease" }}>
                {/* Summary bar */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-500/8 border border-indigo-500/20 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="text-xs font-black text-white/60">
                    <span className="text-indigo-400">{selectedSections.length}</span> section{selectedSections.length !== 1 ? "s" : ""} selected
                    {selectedSections.length === 0 && <span className="text-white/30"> — will open a blank canvas</span>}
                  </span>
                </div>

                {/* Sections grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WIZARD_SECTIONS.map((s) => {
                    const active = selectedSections.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSection(s.id)}
                        className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${active
                          ? "border-indigo-500/60 bg-indigo-500/10 scale-[1.02] shadow-lg shadow-indigo-500/10"
                          : "border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/15"
                          }`}
                      >
                        {/* Checkmark badge */}
                        <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${active ? "bg-indigo-500 border-indigo-500" : "border-white/20 bg-transparent"}`}>
                          {active && <CheckIcon className="w-3 h-3 text-white" />}
                        </div>

                        {/* Icon placeholder */}
                        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${s.iconBg} flex items-center justify-center mb-3 text-white/60 transition-all ${active ? "text-indigo-300" : "group-hover:text-white/80"}`}>
                          {s.icon}
                        </div>

                        <span className={`text-xs font-black mb-0.5 transition-all ${active ? "text-white" : "text-white/70"}`}>{s.label}</span>
                        <span className="text-[9px] font-medium text-white/30 leading-tight">{s.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0 gap-3">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!closable) {
                    window.location.href = "/";
                  } else {
                    handleClose();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
              >
                Cancel
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25"
              >
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                  </svg>
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
                {isSubmitting ? "Creating..." : "Create & Start Building"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
