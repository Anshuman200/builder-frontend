// sections/gallery.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/@Types";

export const gallerySections: SectionTemplate[] = [
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
      const masonry = makeBlock("masonry", { 
        columns: { xs: 2, sm: 2, md: 3, lg: 4 },
        gap: 20,
        padding: "0px"
      });
      
      masonry.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("media-picker", { borderRadius: "12px" }),
      ];

      root.props.childBlocks = [
        makeBlock("text", {
            content: "Nature Gallery",
            tag: "h2",
            align: "center",
            fontSize: "2.5rem",
            bold: true,
            color: "var(--text)"
        }),
        makeBlock("text", {
            content: "Explore the beauty of the world through our curated collection.",
            tag: "p",
            align: "center",
            fontSize: "1.1rem",
            color: "var(--text-muted)",
            marginTop: "-0.5rem",
            marginBottom: "3rem"
        }),
        masonry
      ];
      return root;
    },
  },
];
