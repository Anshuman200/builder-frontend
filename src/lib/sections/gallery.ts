// sections/gallery.ts
import { makeBlock } from "../blockConfig";
import type { SectionTemplate } from "@/@Types";

export const gallerySections: SectionTemplate[] = [
    {
        id: "gallery-grid",
        name: "Gallery Grid",
        category: "Gallery",
        preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:8px;text-align:center">Gallery</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${[
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80",
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&q=80",
                "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=100&q=80",
                "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=100&q=80"
            ].map(src => `<div style="height:35px;background:url(${src}) center/cover;border-radius:4px;border:1px solid var(--border)"></div>`).join("")}
      </div>
    </div>`,
        create: () => {
            const root = makeBlock("container", { bgColor: "#ffffff", padding: "4rem 2rem" });
            const col1 = makeBlock("columns", { leftWidth: "50", gap: "1rem" });
            col1.props.col0 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", borderRadius: "8px", aspectRatio: "4/3" })];
            col1.props.col1 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80", borderRadius: "8px", aspectRatio: "4/3" })];
            const col2 = makeBlock("columns", { leftWidth: "50", gap: "1rem" });
            col2.props.col0 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=80", borderRadius: "8px", aspectRatio: "4/3" })];
            col2.props.col1 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80", borderRadius: "8px", aspectRatio: "4/3" })];
            root.props.childBlocks = [
                makeBlock("text", { content: "Gallery", tag: "h2", fontSize: "2.5rem", bold: true, align: "center", marginBottom: "2rem" }),
                col1, col2,
            ];
            return root;
        },
    },
    {
        id: "gallery-masonry",
        name: "Gallery Masonry",
        category: "Gallery",
        preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="height:48px;background:url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80) center/cover;border-radius:4px;border:1px solid var(--border)"></div>
          <div style="height:64px;background:url(https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=100&q=80) center/cover;border-radius:4px;border:1px solid var(--border)"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="height:64px;background:url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&q=80) center/cover;border-radius:4px;border:1px solid var(--border)"></div>
          <div style="height:48px;background:url(https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=100&q=80) center/cover;border-radius:4px;border:1px solid var(--border)"></div>
        </div>
      </div>
    </div>`,
        create: () => {
            const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
            const cols = makeBlock("columns", { leftWidth: "50", gap: "1rem" });
            cols.props.col0 = [
                makeBlock("image", { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", borderRadius: "8px", aspectRatio: "2/3" }),
                makeBlock("image", { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&q=80", borderRadius: "8px", aspectRatio: "4/3", marginTop: "1rem" }),
            ];
            cols.props.col1 = [
                makeBlock("image", { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80", borderRadius: "8px", aspectRatio: "4/3" }),
                makeBlock("image", { src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80", borderRadius: "8px", aspectRatio: "2/3", marginTop: "1rem" }),
            ];
            root.props.childBlocks = [cols];
            return root;
        },
    },
];
