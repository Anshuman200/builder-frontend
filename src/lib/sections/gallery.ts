// sections/gallery.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const gallerySections: SectionTemplate[] = [
  {
    id: "gallery-masonry",
    name: "Gallery Masonry",
    category: "Gallery",
    previewImage: "/previews/gallery/gallery-masonry.png",
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      const masonry = makeBlock("masonry", {
        columns: 4,
        columnsTablet: 2,
        columnsMobile: 1,
        gap: 20,
        padding: "0px"
      });

      masonry.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
        makeBlock("image", { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", borderRadius: "12px", aspectRatio: "auto", height: "auto" }),
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
