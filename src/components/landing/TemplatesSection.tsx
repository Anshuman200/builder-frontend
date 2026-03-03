"use client";

import { useTemplates } from "@/lib/api/queries";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

function getGradient(seed: string) {
    const colors = [
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "linear-gradient(135deg, #3b82f6, #2dd4bf)",
        "linear-gradient(135deg, #f59e0b, #ef4444)",
        "linear-gradient(135deg, #10b981, #3b82f6)",
    ];
    const idx = seed.length % colors.length;
    return colors[idx];
}

export function TemplatesSection() {
    const { data: templates, isLoading } = useTemplates();
    const router = useRouter();

    if (isLoading) return null;
    if (!templates || templates.length === 0) return null;

    return (
        <section style={{ padding: "100px 24px", background: "var(--bg-secondary)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 64 }}>
                    <h2 style={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        color: "var(--text)",
                        marginBottom: 16,
                        letterSpacing: "-0.02em"
                    }}>
                        Community Templates
                    </h2>
                    <p style={{
                        fontSize: "1.125rem",
                        color: "var(--text-muted)",
                        maxWidth: 600,
                        margin: "0 auto",
                        lineHeight: 1.6
                    }}>
                        Kickstart your next project with one of our beautifully designed templates, created by the community.
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 32
                }}>
                    {templates.slice(0, 6).map((template: any) => (
                        <div
                            key={template._id}
                            onClick={() => router.push(`/editor/${template._id}`)}
                            style={{
                                background: "var(--surface)",
                                borderRadius: 20,
                                border: "1px solid var(--border)",
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                            className="hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/30"
                        >
                            <div style={{
                                height: 180,
                                background: getGradient(template.title),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative"
                            }}>
                                <div style={{
                                    fontSize: "4rem",
                                    fontWeight: 900,
                                    color: "rgba(255,255,255,0.25)",
                                    userSelect: "none",
                                }}>
                                    {(template.title || "T")[0].toUpperCase()}
                                </div>
                                {template.category && (
                                    <div style={{
                                        position: "absolute",
                                        top: 16,
                                        left: 16,
                                        background: "rgba(255,255,255,0.9)",
                                        color: "#6366f1",
                                        padding: "4px 12px",
                                        borderRadius: 20,
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        backdropFilter: "blur(4px)"
                                    }}>
                                        {template.category}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: 24 }}>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {template.title}
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", color: "var(--primary)", fontWeight: 600, fontSize: "0.95rem", gap: 6, marginTop: 16 }}>
                                    Use Template <ArrowRightIcon style={{ width: 16, height: 16 }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
