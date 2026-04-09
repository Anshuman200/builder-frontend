import { useEffect } from "react";
import type { EditorPage } from "@/types";

export function useLiveHead(page: EditorPage | null | undefined) {
    useEffect(() => {
        if (!page) return;

        // Update Title
        if (page.title) {
            document.title = `${page.title} - Editor`;
        } else {
            document.title = "Untitled - Editor";
        }

        // Update Favicon
        const faviconUrl = page.meta?.favicon || "/favicon.ico";
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = faviconUrl;
        
    }, [page?.title, page?.meta?.favicon]);
}
