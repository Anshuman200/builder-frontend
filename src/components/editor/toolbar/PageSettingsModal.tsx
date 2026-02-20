"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/stores/editorStore";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "general" | "seo" | "theme";

const BORDER_RADIUS_OPTIONS = ["none", "sm", "md", "lg", "full"] as const;
const SPACING_OPTIONS = ["compact", "normal", "relaxed"] as const;
const FONT_OPTIONS = ["Inter", "Roboto", "Poppins", "Lato", "Merriweather", "Playfair Display"];

export function PageSettingsModal() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("general");
    const { page, updateMeta, updateTheme } = useEditorStore();

    if (!page) return null;

    const tabClass = (t: Tab) =>
        cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            tab === t
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
        );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    title="Page Settings"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-all"
                >
                    <Settings size={14} />
                </button>
            </DialogTrigger>
            <DialogContent className="!bg-[#111113] !border-white/10 !text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-white text-base">Page Settings</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/4 rounded-lg p-0.5 w-fit">
                    <button className={tabClass("general")} onClick={() => setTab("general")}>General</button>
                    <button className={tabClass("seo")} onClick={() => setTab("seo")}>SEO</button>
                    <button className={tabClass("theme")} onClick={() => setTab("theme")}>Theme</button>
                </div>

                {/* General */}
                {tab === "general" && (
                    <div className="space-y-4">
                        <Field label="Page Title">
                            <input
                                type="text"
                                defaultValue={page.title}
                                onBlur={(e) => updateMeta({ title: e.target.value })}
                                className="input-dark"
                                placeholder="My Awesome Page"
                            />
                        </Field>
                        <Field label="Slug">
                            <div className="flex items-center gap-2">
                                <span className="text-white/30 text-xs shrink-0">pagecraft.io/p/</span>
                                <input
                                    type="text"
                                    defaultValue={page.slug}
                                    onBlur={(e) => {
                                        const slug = slugify(e.target.value);
                                        e.target.value = slug;
                                    }}
                                    className="input-dark flex-1"
                                    placeholder="my-page"
                                />
                            </div>
                        </Field>
                        <Field label="Status">
                            <span
                                className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    page.status === "PUBLISHED"
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-white/8 text-white/50"
                                )}
                            >
                                {page.status}
                            </span>
                        </Field>
                    </div>
                )}

                {/* SEO */}
                {tab === "seo" && (
                    <div className="space-y-4">
                        <Field label="Meta Title">
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    defaultValue={page.meta.title ?? ""}
                                    onBlur={(e) => updateMeta({ title: e.target.value })}
                                    maxLength={60}
                                    className="input-dark"
                                    placeholder="Page title for search engines"
                                />
                                <p className="text-[10px] text-white/25">
                                    {(page.meta.title ?? "").length}/60 characters
                                </p>
                            </div>
                        </Field>
                        <Field label="Meta Description">
                            <div className="space-y-1">
                                <textarea
                                    defaultValue={page.meta.description ?? ""}
                                    onBlur={(e) => updateMeta({ description: e.target.value })}
                                    maxLength={160}
                                    rows={3}
                                    className="input-dark resize-none"
                                    placeholder="Brief description for search engines"
                                />
                                <p className="text-[10px] text-white/25">
                                    {(page.meta.description ?? "").length}/160 characters
                                </p>
                            </div>
                        </Field>
                        <Field label="OG Image URL">
                            <input
                                type="text"
                                defaultValue={page.meta.ogImage ?? ""}
                                onBlur={(e) => updateMeta({ ogImage: e.target.value })}
                                className="input-dark"
                                placeholder="https://..."
                            />
                        </Field>
                        <Field label="Robots">
                            <select
                                defaultValue={page.meta.robots ?? "index, follow"}
                                onChange={(e) => updateMeta({ robots: e.target.value })}
                                className="input-dark"
                            >
                                <option value="index, follow">index, follow</option>
                                <option value="noindex, nofollow">noindex, nofollow</option>
                                <option value="noindex, follow">noindex, follow</option>
                            </select>
                        </Field>
                    </div>
                )}

                {/* Theme */}
                {tab === "theme" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {(["primary", "secondary", "background", "text"] as const).map((key) => (
                                <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={page.theme.colors[key]}
                                            onChange={(e) =>
                                                updateTheme({
                                                    colors: { ...page.theme.colors, [key]: e.target.value },
                                                })
                                            }
                                            className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={page.theme.colors[key]}
                                            onChange={(e) =>
                                                updateTheme({
                                                    colors: { ...page.theme.colors, [key]: e.target.value },
                                                })
                                            }
                                            className="input-dark flex-1 font-mono text-xs"
                                        />
                                    </div>
                                </Field>
                            ))}
                        </div>
                        <Field label="Heading Font">
                            <select
                                value={page.theme.fonts.heading}
                                onChange={(e) =>
                                    updateTheme({ fonts: { ...page.theme.fonts, heading: e.target.value } })
                                }
                                className="input-dark"
                            >
                                {FONT_OPTIONS.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Body Font">
                            <select
                                value={page.theme.fonts.body}
                                onChange={(e) =>
                                    updateTheme({ fonts: { ...page.theme.fonts, body: e.target.value } })
                                }
                                className="input-dark"
                            >
                                {FONT_OPTIONS.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Border Radius">
                            <div className="flex gap-1">
                                {BORDER_RADIUS_OPTIONS.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => updateTheme({ borderRadius: r })}
                                        className={cn(
                                            "flex-1 py-1 text-xs rounded transition-all",
                                            page.theme.borderRadius === r
                                                ? "bg-indigo-500/20 text-indigo-400"
                                                : "bg-white/4 text-white/40 hover:bg-white/8"
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Spacing">
                            <div className="flex gap-1">
                                {SPACING_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => updateTheme({ spacing: s })}
                                        className={cn(
                                            "flex-1 py-1 text-xs rounded transition-all",
                                            page.theme.spacing === s
                                                ? "bg-indigo-500/20 text-indigo-400"
                                                : "bg-white/4 text-white/40 hover:bg-white/8"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}
