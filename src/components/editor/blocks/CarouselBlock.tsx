"use client";

import React, { useEffect } from "react";
import { Carousel as AntCarousel } from "antd";
import type { Block } from "@/@Types";
import { PreviewContext, ChildBlockWrapper, type BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";

export function CarouselBlock({ block }: BlockProps) {
  const isPreview = React.useContext(PreviewContext);
  const { props, children = [] } = block;
  const updateBlock = useEditorStore((s) => s.updateBlock);
  
  // Extract props
  const slidesCount = (props.slidesCount as number) || 3;
  const autoplay = props.autoplay as boolean ?? true;
  const dots = props.dots as boolean ?? true;
  const arrows = props.arrows as boolean ?? true;
  const fade = props.fade as boolean ?? false;
  const speed = (props.speed as number) || 500;
  const autoplaySpeed = (props.autoplaySpeed as number) || 3000;
  
  // Initialize slides if they don't exist yet
  useEffect(() => {
    if (isPreview) return; // Don't mutate during preview

    if (children.length !== slidesCount) {
      if (children.length < slidesCount) {
        // Add missing slides
        const diff = slidesCount - children.length;
        const newSlides: Block[] = Array.from({ length: diff }).map(() => ({
          id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "container",
          props: {
            padding: "24px",
            bgColor: "transparent",
            borderRadius: "0px",
            maxWidth: "100%",
          },
          children: [],
        }));
        
        updateBlock(block.id, {
          children: [...children, ...newSlides],
        });
      } else {
        // Remove excess, keeping the first `slidesCount` items
        updateBlock(block.id, {
          children: children.slice(0, slidesCount),
        });
      }
    }
  }, [slidesCount]); // intentionally only run when slidesCount changes to avoid infinite loops

  // Base styling
  const style: React.CSSProperties = {
    padding: (props.padding as string) || "24px",
    backgroundColor: (props.bgColor as string) || "transparent",
    width: "100%",
    position: "relative",
  };
  
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
      <div className="w-full relative [&_.ant-carousel_.slick-dots_li_button]:bg-indigo-500 [&_.ant-carousel_.slick-dots_li.slick-active_button]:bg-indigo-600 [&_.ant-carousel_.slick-prev]:text-indigo-600 [&_.ant-carousel_.slick-next]:text-indigo-600">
        <AntCarousel {...carouselConfig}>
          {children.map((slideBlock: Block, index: number) => (
            <div key={slideBlock.id}>
              {/* SLIDE WRAPPER */}
              <div 
                className={`w-full ${!isPreview ? 'min-h-[150px] border border-dashed border-white/20' : ''}`}
                style={{ padding: "0 20px" }}
              >
                {!isPreview && (
                   <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-wider text-center pt-2 pointer-events-none">
                     Slide {index + 1}
                   </div>
                )}
                {/* 
                   In edit mode, pointer-events needs to be active so we can drag elements into the wrapper.
                   But this makes it hard to drag the carousel itself.
                 */}
                 <div className="min-h-[100px]">
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
