// sections/hero.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const heroSections: SectionTemplate[] = [
    {
        id: "hero-split",
        name: "Hero Heading Left",
        category: "Hero",
        previewImage: "/previews/hero/hero-split.png",
        create: () => {
            const root = makeBlock("hero", { align: "left", layout: "fluid", bgColor: "#0f172a", textColor: "#ffffff", padding: "6rem 2rem" });
            const columns = makeBlock("columns", { leftWidth: "50", gap: "2rem", align: "center" });
            columns.props.col0 = [
                makeBlock("text", { content: "Launch your next big idea", tag: "h1", fontSize: "3.5rem", color: "#ffffff", bold: true, lineHeight: "1.2" }),
                makeBlock("text", {
                    content: `Build stunning pages in minutes with our powerful drag-and-drop builder. 
⚡ Effortless drag-and-drop page creation  
⚡ Pixel-perfect design control  
⚡ Fast, reliable, and scalable infrastructure  
⚡ Seamless user experience across devices  
⚡ Designed for speed, built for impact  

⚡ Build stunning pages in minutes with an intuitive drag-and-drop builder  
⚡ No coding required—design with speed and precision  
⚡ Fully responsive layouts optimized for all devices  
⚡ Customize every element to match your brand  
⚡ Launch faster with a seamless, user-friendly workflow
` , tag: "p", fontSize: "1.25rem", color: "#cbd5e1", marginTop: "1.5rem"
                }),
                makeBlock("button", { label: "Get Started", variant: "solid", bgColor: "#3b82f6", textColor: "#ffffff", size: "lg", marginTop: "2rem", fullWidth: false, borderRadius: "8px" }),
            ];
            columns.props.col1 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", alt: "Hero", borderRadius: "16px", aspectRatio: "4/3", objectFit: "cover" })];
            root.props.childBlocks = [columns];
            return root;
        },
    },
    {
        id: "hero-centered",
        name: "Hero Heading Center",
        category: "Hero",
        previewImage: "/previews/hero/hero-centered.png",
        create: () => {
            const root = makeBlock("hero", { align: "center", bgColor: "#1e293b", bgImage: "https://d1xyjpr3hmv834.cloudfront.net/forks/69e89d8ba46d399a08afd4f9_465259073706.png", bgOverlay: "rgba(15,23,42,0.95)", textColor: "#ffffff", padding: "8rem 2rem", minHeight: "80vh" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Design Everything.", tag: "h1", fontSize: "4.5rem", color: "#ffffff", bold: true, align: "center", lineHeight: "1.1" }),
                makeBlock("text", { content: "The most powerful builder for modern creative teams to launch fast.", tag: "p", fontSize: "1.5rem", color: "#e2e8f0", align: "center", marginTop: "1.5rem" }),
                makeBlock("button", { label: "Start for free", variant: "gradient", gradientFrom: "#000", gradientTo: "#0000ff", textColor: "#ffffff", size: "xl", align: "center", marginTop: "3rem", fullWidth: false, borderRadius: "8px" }),
            ];
            return root;
        },
    },
    {
        id: "hero-right",
        name: "Hero Heading Right",
        category: "Hero",
        previewImage: "/previews/hero/hero-right.png",
        create: () => {
            const root = makeBlock("hero", { align: "right", bgColor: "#1e293b", bgImage: "https://d1xyjpr3hmv834.cloudfront.net/uploads/1776851692839_j02e4jwr_AI&Automation.png", bgOverlay: "rgba(15,23,42,0.95)", textColor: "#ffffff", padding: "8rem 2rem", minHeight: "80vh" });
            const columns = makeBlock("columns", { leftWidth: "50", gap: "2rem", align: "center" });
            columns.props.col0 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80", alt: "Hero", borderRadius: "8px", aspectRatio: "4/3" })];
            columns.props.col1 = [
                makeBlock("text", { content: "Track your growth", tag: "h1", fontSize: "3.5rem", color: "#ffffff", bold: true }),
                makeBlock("text", {
                    content: `Build stunning pages in minutes with our powerful drag-and-drop builder. 
⚡ Effortless drag-and-drop page creation  
⚡ Pixel-perfect design control
⚡ Seamless user experience across devices  
⚡ Designed for speed, built for impact  

⚡ No coding required—design with speed and precision  
⚡ Fully responsive layouts optimized for all devices  
⚡ Customize every element to match your brand  
⚡ Launch faster with a seamless, user-friendly workflow  
` , tag: "p", fontSize: "1.25rem", color: "#cbd5e1", marginTop: "1.5rem"
                }),
                makeBlock("button", { label: "View Demo", variant: "solid", bgColor: "#0f172a", textColor: "#ffffff", size: "lg", marginTop: "2rem", fullWidth: false }),
            ];
            root.props.childBlocks = [columns];
            return root;
        },
    },
    {
        id: "hero-stack",
        name: "Hero Stack",
        category: "Hero",
        previewImage: "/previews/hero/hero-stack.png",
        create: () => {
            const root = makeBlock("hero", { align: "center", bgColor: "#1e293b", bgImage: "https://d1xyjpr3hmv834.cloudfront.net/uploads/1776851692839_j02e4jwr_AI&Automation.png", bgOverlay: "rgba(15,23,42,0.95)", textColor: "#ffffff", padding: "8rem 2rem", minHeight: "60vh" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Experience the Future", tag: "h1", fontSize: "3rem", color: "#ffffff", bold: true, align: "center" }),
                makeBlock("text", { content: "A new way to build web applications without the complexity.", tag: "p", fontSize: "1.2rem", color: "#fff", align: "center", marginTop: "1rem" }),
                makeBlock("image", { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80", alt: "Hero", borderRadius: "8px", aspectRatio: "16/7", marginTop: "3rem" }),
            ];
            return root;
        },
    },
];
