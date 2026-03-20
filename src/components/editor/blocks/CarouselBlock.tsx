"use client";

import React, { useEffect } from "react";
import { Carousel as AntCarousel } from "antd";
import type { Block } from "@/@Types";
import { PreviewContext, ChildBlockWrapper, type BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";

export function CarouselBlock({ block }: BlockProps) {
  const isPreview = React.useContext(PreviewContext);
  const { props } = block;
  const childBlocks = (props.childBlocks as Block[]) || [];
  const updateBlock = useEditorStore((s) => s.updateBlock);

  // Extract new props
  const height = (props.height as string) || "500px";
  const arrowColor = (props.arrowColor as string) || "var(--primary)";
  const dotColor = (props.dotColor as string) || "rgba(255,255,255,0.2)";
  const activeDotColor = (props.activeDotColor as string) || "var(--primary)";
  const arrowSize = (props.arrowSize as string) || "24px";
  const arrowPosition = (props.arrowPosition as string) || "middle";

  const autoplay = props.autoplay as boolean ?? true;
  const dots = props.dots as boolean ?? true;
  const arrows = props.arrows as boolean ?? true;
  const fade = props.fade as boolean ?? false;
  const speed = (props.speed as number) || 500;
  const autoplaySpeed = (props.autoplaySpeed as number) || 3000;

  // Base styling
  const style: React.CSSProperties = {
    padding: (props.padding as string) || "24px",
    backgroundColor: (props.bgColor as string) || "transparent",
    width: "100%",
    position: "relative",
  };

  const arrowTopMap: Record<string, string> = {
    top: "15%",
    middle: "50%",
    bottom: "85%",
  };
  const isBottomDots = arrowPosition === "bottom-dots";
  const arrowTop = isBottomDots ? "auto" : (arrowTopMap[arrowPosition] || "50%");
  const arrowBottom = isBottomDots ? "20px" : "auto";
  const mediaFit = (props.mediaFit as string) || "cover";

  // Disable internal drag in editor so dnd-kit can work
  const carouselConfig = {
    autoplay: isPreview ? autoplay : false,
    dots: dots,
    arrows: arrows,
    fade: fade,
    speed: speed,
    autoplaySpeed: autoplaySpeed,
    draggable: isPreview,
    infinite: true,
  };

  return (
    <div style={style}>
      <style>{`
        #carousel-${block.id} .ant-carousel .slick-dots { 
          bottom: 12px !important; 
          margin: 0 !important;
          display: flex !important; 
          align-items: center !important; 
          justify-content: center !important;
          height: 32px !important;
          z-index: 10 !important;
        }
        #carousel-${block.id} .ant-carousel .slick-dots li { 
          margin: 0 4px !important; 
          display: flex !important;
          align-items: center !important;
        }
        #carousel-${block.id} .ant-carousel .slick-dots li button { 
          background: ${dotColor} !important; 
          opacity: 0.3 !important;
          height: 4px !important; 
          width: 12px !important;
          border-radius: 2px !important;
        }
        #carousel-${block.id} .ant-carousel .slick-dots li.slick-active button { 
          background: ${activeDotColor} !important; 
          opacity: 1 !important;
          width: 20px !important;
        }
        /* Media Fit Fixes */
        #carousel-${block.id} img { 
          max-height: 100% !important; 
          height: 100%;
          width: 100%;
          object-fit: ${mediaFit}; 
        }
        #carousel-${block.id} .ant-image, 
        #carousel-${block.id} .ant-image-img {
          height: 100%;
          width: 100%;
        }
        #carousel-${block.id} [style*="height"] {
          max-height: 100% !important;
        }
        /* Custom Arrows */
        #carousel-${block.id} .ant-carousel .slick-prev, 
        #carousel-${block.id} .ant-carousel .slick-next { 
          color: ${arrowColor} !important; 
          font-size: ${arrowSize} !important; 
          top: ${isBottomDots ? "auto" : arrowTop} !important;
          bottom: ${isBottomDots ? "12px" : "auto"} !important;
          z-index: 20 !important;
          transform: ${isBottomDots ? "none" : "translateY(-50%)"} !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          opacity: 0.8 !important;
          background: transparent !important;
        }
        /* Wipe out ALL default antd arrow icons */
        #carousel-${block.id} .ant-carousel .slick-prev::before,
        #carousel-${block.id} .ant-carousel .slick-next::before,
        #carousel-${block.id} .ant-carousel .slick-prev::after,
        #carousel-${block.id} .ant-carousel .slick-next::after {
          content: "" !important;
          display: none !important;
        }
        
        /* Inject our own clean arrow icons */
        #carousel-${block.id} .ant-carousel .slick-prev { 
          left: ${isBottomDots ? "calc(50% - 100px)" : "24px"} !important; 
        }
        #carousel-${block.id} .ant-carousel .slick-prev::before {
          content: "←" !important;
          display: block !important;
          color: ${arrowColor} !important;
        }
        #carousel-${block.id} .ant-carousel .slick-next { 
          right: ${isBottomDots ? "calc(50% - 100px)" : "24px"} !important; 
        }
        #carousel-${block.id} .ant-carousel .slick-next::before {
          content: "→" !important;
          display: block !important;
          color: ${arrowColor} !important;
        }
      `}</style>
      <div id={`carousel-${block.id}`} className="w-full relative" style={{ height: height, overflow: 'hidden' }}>
        <AntCarousel {...carouselConfig}>
          {childBlocks.map((slideBlock: Block, index: number) => (
            <div key={slideBlock.id}>
              {/* SLIDE WRAPPER */}
              <div
                className={`w-full flex flex-col ${isBottomDots ? 'justify-end' : 'justify-center'} ${!isPreview ? 'border border-dashed border-white/10 rounded-xl bg-white/5' : ''}`}
                style={{
                  padding: isPreview ? (isBottomDots ? "0 0 50px 0" : "0") : (isBottomDots ? "10px 20px 60px" : "10px 20px 30px"),
                  height: height,
                }}
              >
                {!isPreview && (
                  <div className="text-[10px] text-zinc-500 font-bold mb-4 uppercase tracking-wider text-center pt-3 pointer-events-none opacity-50">
                    Slide {index + 1}
                  </div>
                )}
                <div className={`flex flex-col justify-center ${isBottomDots ? '' : 'flex-1'}`}>
                  <ChildBlockWrapper block={slideBlock} />
                </div>
              </div>
            </div>
          ))}
        </AntCarousel>
      </div>
    </div>
  );
}
