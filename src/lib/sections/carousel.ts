// sections/carousel.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const carouselSections: SectionTemplate[] = [
  {
    id: "carousel-product",
    name: "Product Showcase Carousel",
    category: "Carousel",
    preview: `<div style="font-family:sans-serif;padding:12px;background:#fefce8;border-radius:8px;text-align:center">
      <div style="width:40px;height:40px;margin:10px auto;background:#fbbf24;border-radius:4px"></div>
      <div style="font-size:10px;font-weight:bold;color:#92400e">SLIDER</div>
      <div style="display:flex;justify-content:center;gap:4px;margin-top:8px">
        <div style="width:6px;height:6px;background:#fbbf24;border-radius:3px"></div>
        <div style="width:6px;height:6px;background:#e5e7eb;border-radius:3px"></div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#fffbeb", padding: "4rem 2rem" });
      const carousel = makeBlock("carousel", { 
        slidesCount: 3, 
        autoplay: true, 
        dots: true, 
        arrows: true,
        padding: "0px"
      });
      
      const slide1 = makeBlock("container", { padding: "40px", bgColor: "transparent", childBlocks: [] });
      slide1.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", height: "400px", borderRadius: "20px" }),
        makeBlock("text", { content: "Premium Watch Collection", tag: "h3", align: "center", fontSize: "1.5rem", bold: true, marginTop: "1rem" }),
      ];

      const slide2 = makeBlock("container", { padding: "40px", bgColor: "transparent", childBlocks: [] });
      slide2.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", height: "400px", borderRadius: "20px" }),
        makeBlock("text", { content: "Studio Grade Headphones", tag: "h3", align: "center", fontSize: "1.5rem", bold: true, marginTop: "1rem" }),
      ];

      const slide3 = makeBlock("container", { padding: "40px", bgColor: "transparent", childBlocks: [] });
      slide3.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", height: "400px", borderRadius: "20px" }),
        makeBlock("text", { content: "Elite Sport Shoes", tag: "h3", align: "center", fontSize: "1.5rem", bold: true, marginTop: "1rem" }),
      ];

      carousel.props.childBlocks = [slide1, slide2, slide3];
      root.props.childBlocks = [carousel];
      return root;
    },
  },
  {
    id: "carousel-marketing",
    name: "Marketing Analytics Carousel",
    category: "Carousel",
    preview: `<div style="font-family:sans-serif;padding:12px;background:#1e1b4b;border-radius:8px;color:#fff">
      <div style="display:flex;gap:8px;align-items:center">
        <div style="flex:1">
          <div style="height:6px;width:30px;background:#6366f1;margin-bottom:4px"></div>
          <div style="height:4px;width:50px;background:#4338ca"></div>
        </div>
        <div style="width:24px;height:24px;background:#6366f1;border-radius:4px"></div>
      </div>
      <div style="margin-top:10px;display:flex;justify-content:center;gap:2px">
        <div style="width:12px;height:4px;background:#6366f1;border-radius:2px"></div>
        <div style="width:4px;height:4px;background:#312e81;border-radius:2px"></div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#0f172a", padding: "6rem 2rem" });
      const carousel = makeBlock("carousel", { 
        slidesCount: 2, 
        autoplay: true, 
        dots: true, 
        arrows: false,
        padding: "0px"
      });

      const slide1 = makeBlock("container", { padding: "0px", bgColor: "transparent", childBlocks: [] });
      const cols1 = makeBlock("columns", { gap: "4rem", childBlocks: [] });
      cols1.props.col0 = [
        makeBlock("text", { content: "Real-time Growth Insights", tag: "h2", fontSize: "3rem", bold: true, color: "#ffffff", align: "left" }),
        makeBlock("text", { content: "Monitor your business performance with live data and smart recommendations.", tag: "p", fontSize: "1.2rem", color: "#94a3b8", align: "left", marginTop: "1rem" }),
        makeBlock("button", { label: "Explore Dashboard →", variant: "solid", bgColor: "#6366f1", marginTop: "2rem" }),
      ];
      cols1.props.col1 = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", borderRadius: "24px", height: "400px" }),
      ];
      slide1.props.childBlocks = [cols1];

      const slide2 = makeBlock("container", { padding: "0px", bgColor: "transparent", childBlocks: [] });
      const cols2 = makeBlock("columns", { gap: "4rem", childBlocks: [] });
      cols2.props.col0 = [
        makeBlock("text", { content: "Smart Audience Targeting", tag: "h2", fontSize: "3rem", bold: true, color: "#ffffff", align: "left" }),
        makeBlock("text", { content: "Reach the right people at the right time with our AI-powered ad system.", tag: "p", fontSize: "1.2rem", color: "#94a3b8", align: "left", marginTop: "1rem" }),
        makeBlock("button", { label: "Start Targeting →", variant: "solid", bgColor: "#6366f1", marginTop: "2rem" }),
      ];
      cols2.props.col1 = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", borderRadius: "24px", height: "400px" }),
      ];
      slide2.props.childBlocks = [cols2];

      carousel.props.childBlocks = [slide1, slide2];
      root.props.childBlocks = [carousel];
      return root;
    },
  },
  {
    id: "carousel-photography",
    name: "Photography Slider",
    category: "Carousel",
    preview: `<div style="font-family:sans-serif;background:#000;border-radius:8px;overflow:hidden;height:80px;position:relative">
      <div style="position:absolute;bottom:8px;left:8px">
        <div style="height:6px;width:30px;background:#fff;opacity:0.8;margin-bottom:2px"></div>
        <div style="height:4px;width:20px;background:#fff;opacity:0.5"></div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { padding: "0px", maxWidth: "100%" });
      const carousel = makeBlock("carousel", { 
        slidesCount: 2, 
        autoplay: true, 
        dots: true, 
        arrows: true,
        padding: "0px"
      });

      const slide1 = makeBlock("container", { padding: "0px", bgColor: "transparent", childBlocks: [], maxWidth: "100%" });
      const slide1Content = makeBlock("container", { 
        position: "absolute", bottom: "4rem", left: "4rem", padding: "0px", bgColor: "transparent", childBlocks: [], align: "left"
      });
      slide1Content.props.childBlocks = [
        makeBlock("text", { content: "Mountain Peaks", tag: "h2", fontSize: "4rem", bold: true, color: "#ffffff" }),
        makeBlock("text", { content: "Discover the untouched wilderness", tag: "p", fontSize: "1.5rem", color: "rgba(255,255,255,0.8)" }),
      ];
      slide1.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80", height: "80vh", width: "100%" }),
        slide1Content
      ];

      const slide2 = makeBlock("container", { padding: "0px", bgColor: "transparent", childBlocks: [], maxWidth: "100%" });
      const slide2Content = makeBlock("container", { 
        position: "absolute", bottom: "4rem", left: "4rem", padding: "0px", bgColor: "transparent", childBlocks: [], align: "left"
      });
      slide2Content.props.childBlocks = [
        makeBlock("text", { content: "Enchanted Forests", tag: "h2", fontSize: "4rem", bold: true, color: "#ffffff" }),
        makeBlock("text", { content: "Lose yourself in the green maze", tag: "p", fontSize: "1.5rem", color: "rgba(255,255,255,0.8)" }),
      ];
      slide2.props.childBlocks = [
        makeBlock("image", { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80", height: "80vh", width: "100%" }),
        slide2Content
      ];

      carousel.props.childBlocks = [slide1, slide2];
      root.props.childBlocks = [carousel];
      return root;
    },
  },
];
