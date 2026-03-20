import type { SectionTemplate } from "@/@Types";
import { makeBlock } from "../config/blocks";

const dummyFaqsFull = [
    { id: "1", title: "Eiusmod incididunt ut labore dolore?", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
    { id: "2", title: "Ut enim ad minim veniam?", content: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { id: "3", title: "Duis irure dolor in reprehenderit?", content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { id: "4", title: "Consectetur elit sed do eiusmod?", content: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure." },
    { id: "5", title: "Ut tempor enim ad minim veniam?", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
    { id: "6", title: "Eiusmod incididunt ut labore dolore?", content: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
];

const dummyFaqsShort = [
    { id: "1", title: "Eiusmod tempor incididunt ut labore dolore?", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum." },
    { id: "2", title: "Voluptatem doloremque?", content: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse." },
    { id: "3", title: "Unde omnis iste natus error sit?", content: "Voluptatem accusantium doloremque laudantium, totam rem." },
    { id: "4", title: "Beatae dicta sunt explicabo?", content: "Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut." },
];

export const faqSections: SectionTemplate[] = [
    {
        id: "faq-simple",
        category: "FAQ",
        name: "Simple FAQ",
        preview: `<div style="font-family:sans-serif;background:#fff;padding:2rem 1rem;text-align:center;">
       <h3 style="margin:0 0 1rem 0;font-size:1.2rem;color:#0f172a;">Frequently Asked Questions</h3>
       <div style="background:#f8fafc;padding:0.5rem 1rem;border-radius:6px;margin-bottom:0.5rem;text-align:left;color:#333;font-size:0.85rem;">Q. How does it work? <span>▼</span></div>
       <div style="background:#f8fafc;padding:0.5rem 1rem;border-radius:6px;margin-bottom:0.5rem;text-align:left;color:#333;font-size:0.85rem;">Q. What is the pricing? <span>▼</span></div>
       <div style="background:#f8fafc;padding:0.5rem 1rem;border-radius:6px;margin-bottom:0.5rem;text-align:left;color:#333;font-size:0.85rem;">Q. Can I get a refund? <span>▼</span></div>
    </div>`,
        create: () =>
            makeBlock("container", {
                padding: "64px 24px",
                bgColor: "#ffffff",
                maxWidth: "100dvw",
                childBlocks: [
                    makeBlock("text", {
                        content: "FAQ",
                        tag: "p",
                        align: "center",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        bold: true,
                        letterSpacing: "0.1em",
                    }),
                    makeBlock("text", {
                        content: "Frequently Asked Questions",
                        tag: "h2",
                        align: "center",
                        fontSize: "2.5rem",
                        color: "#0f172a",
                        bold: true,
                    }),
                    makeBlock("text", {
                        content: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse, quam nihil molestiae consequatur.",
                        tag: "p",
                        align: "center",
                        fontSize: "1.125rem",
                        color: "#64748b",
                        padding: "0 0 40px 0",
                    }),
                    makeBlock("accordion", {
                        items: dummyFaqsShort,
                        variant: "separated",
                        itemBgColor: "#f8fafc",
                        itemBorderColor: "#e2e8f0",
                        iconColor: "#cbd5e1",
                        titleColor: "#334155",
                        contentColor: "#64748b",
                        itemRadius: "8px",
                        divider: "none",
                        titleSize: "16px",
                        titleWeight: "600",
                        descSize: "15px",
                        iconStyle: "chevron",
                        iconSize: "20px",
                    }),
                ],
            }),
    },
    {
        id: "faq-two-cols",
        category: "FAQ",
        name: "Two Columns FAQ",
        preview: `<div style="font-family:sans-serif;background:#fff;padding:2rem 1rem;text-align:center;">
       <h3 style="margin:0 0 1rem 0;font-size:1.2rem;color:#0f172a;">Frequently Asked Questions</h3>
       <div style="display:flex;gap:1rem;">
         <div style="flex:1;"><div style="background:#f8fafc;padding:0.5rem;border-radius:6px;margin-bottom:0.5rem;font-size:0.7rem;">Q. Question 1 <span>▼</span></div></div>
         <div style="flex:1;"><div style="background:#f8fafc;padding:0.5rem;border-radius:6px;margin-bottom:0.5rem;font-size:0.7rem;">Q. Question 2 <span>▼</span></div></div>
       </div>
    </div>`,
        create: () =>
            makeBlock("container", {
                padding: "64px 24px",
                bgColor: "#ffffff",
                maxWidth: "100%",
                childBlocks: [
                    makeBlock("text", {
                        content: "FAQ",
                        tag: "p",
                        align: "center",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        bold: true,
                        letterSpacing: "0.1em",
                    }),
                    makeBlock("text", {
                        content: "Frequently Asked Questions",
                        tag: "h2",
                        align: "center",
                        fontSize: "2.5rem",
                        color: "#0f172a",
                        bold: true,
                        padding: "0 0 40px 0",
                    }),
                    makeBlock("columns", {
                        leftWidth: 50,
                        gap: "2rem",
                        col0: [
                            makeBlock("accordion", {
                                items: dummyFaqsFull.slice(0, 3),
                                variant: "minimal",
                                divider: "line",
                                itemBgColor: "transparent",
                                itemBorderColor: "#e2e8f0",
                                iconColor: "#22c55e",
                                titleColor: "#0f172a",
                                contentColor: "#64748b",
                                titleSize: "16px",
                                titleWeight: "600",
                                descSize: "15px",
                                iconStyle: "chevron",
                                iconSize: "20px",
                            }),
                        ],
                        col1: [
                            makeBlock("accordion", {
                                items: dummyFaqsFull.slice(3, 6),
                                variant: "minimal",
                                divider: "line",
                                itemBgColor: "transparent",
                                itemBorderColor: "#e2e8f0",
                                iconColor: "#22c55e",
                                titleColor: "#0f172a",
                                contentColor: "#64748b",
                                titleSize: "16px",
                                titleWeight: "600",
                                descSize: "15px",
                                iconStyle: "chevron",
                                iconSize: "20px",
                            }),
                        ],
                    }),
                ],
            }),
    },
    {
        id: "faq-split",
        category: "FAQ",
        name: "Split FAQ",
        preview: `<div style="font-family:sans-serif;background:#fff;padding:2rem 1rem;display:flex;gap:1rem;">
       <div style="flex:1;text-align:left;">
         <h3 style="margin:0 0 0.5rem 0;font-size:1.1rem;">Have Any Questions?</h3>
         <p style="font-size:0.7rem;color:#666;">Lorem ipsum dolor sit amet.</p>
         <button style="background:#22c55e;color:#fff;border:none;padding:0.3rem 0.6rem;font-size:0.7rem;border-radius:4px;">Contact Us</button>
       </div>
       <div style="flex:2;">
         <div style="background:#f8fafc;padding:0.5rem;border-radius:4px;margin-bottom:0.5rem;font-size:0.75rem;">Q. Split question 1?</div>
         <div style="background:#f8fafc;padding:0.5rem;border-radius:4px;margin-bottom:0.5rem;font-size:0.75rem;">Q. Split question 2?</div>
       </div>
    </div>`,
        create: () =>
            makeBlock("container", {
                padding: "64px 24px",
                bgColor: "#ffffff",
                maxWidth: "1000px",
                childBlocks: [
                    makeBlock("columns", {
                        leftWidth: 35,
                        gap: "3rem",
                        col0: [
                            makeBlock("text", {
                                content: "DOWNLOADING",
                                tag: "p",
                                align: "left",
                                fontSize: "0.75rem",
                                color: "#64748b",
                                bold: true,
                                letterSpacing: "0.1em",
                            }),
                            makeBlock("text", {
                                content: "Have Any Questions?",
                                tag: "h2",
                                align: "left",
                                fontSize: "2rem",
                                color: "#0f172a",
                                bold: true,
                                padding: "8px 0 16px 0",
                            }),
                            makeBlock("text", {
                                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
                                tag: "p",
                                align: "left",
                                fontSize: "1rem",
                                color: "#64748b",
                                padding: "0 0 24px 0",
                            }),
                            makeBlock("button", {
                                label: "Contact Us",
                                variant: "solid",
                                bgColor: "#22c55e",
                                textColor: "#ffffff",
                                borderRadius: "9999px",
                                align: "left",
                                fullWidth: false,
                            }),
                        ],
                        col1: [
                            makeBlock("accordion", {
                                items: dummyFaqsShort,
                                variant: "separated",
                                itemBgColor: "#f8fafc",
                                itemBorderColor: "transparent",
                                iconColor: "#cbd5e1",
                                titleColor: "#334155",
                                contentColor: "#64748b",
                                itemRadius: "6px",
                                titleSize: "16px",
                                titleWeight: "600",
                                descSize: "15px",
                                iconStyle: "chevron",
                                iconSize: "20px",
                            }),
                        ],
                    }),
                ],
            }),
    },
];
