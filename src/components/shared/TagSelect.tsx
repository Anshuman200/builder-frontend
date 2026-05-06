"use client";

import { Select } from "antd";
import { useMemo } from "react";
import { usePageTags } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

interface TagSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  mode?: "project" | "settings";
}

export default function TagSelect({
  value,
  onChange,
  placeholder = "Choose tags",
  className,
  mode = "project"
}: TagSelectProps) {
  const { data: tags = [], isLoading } = usePageTags();

  // Helper to get selected values from potential mixed input (IDs or full objects)
  const normalizedValue = useMemo(() => 
    value.map(v => typeof v === 'object' ? (v as any)._id : v),
    [value]
  );

  const options = useMemo(() => 
    tags.map((tag: any) => ({
      label: (
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
            style={{ backgroundColor: tag.color || '#6366f1', boxShadow: `0 0 6px ${tag.color || '#6366f1'}44` }} 
          />
          <span>{tag.name}</span>
        </div>
      ),
      value: tag._id
    })),
    [tags]
  );

  return (
    <div className={cn("w-full", className)}>
      <style jsx global>{`
        .custom-tag-select .ant-select-selector {
          background-color: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 12px !important;
          min-height: ${mode === 'project' ? '48px' : '40px'} !important;
          display: flex !important;
          align-items: center !important;
          color: white !important;
          transition: all 0.2s ease !important;
        }
        .custom-tag-select.ant-select-focused .ant-select-selector {
          border-color: rgba(99, 102, 241, 0.5) !important;
          background-color: rgba(99, 102, 241, 0.05) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }
        .custom-tag-select .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.15) !important;
          font-weight: 500 !important;
        }
        .custom-tag-select .ant-select-selection-item {
          background: rgba(99, 102, 241, 0.1) !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          color: #818cf8 !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          height: 24px !important;
          line-height: 22px !important;
          margin-top: 2px !important;
          margin-bottom: 2px !important;
        }
        .custom-tag-select .ant-select-selection-item-remove {
          color: #818cf8 !important;
        }
        .tag-dropdown {
          background-color: #0a0a0a !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
          padding: 4px !important;
          backdrop-filter: blur(12px) !important;
        }
        .tag-dropdown .ant-select-item {
          border-radius: 8px !important;
          color: rgba(255, 255, 255, 0.7) !important;
          margin: 2px 0 !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          transition: all 0.15s ease !important;
        }
        .tag-dropdown .ant-select-item-option-active {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }
        .tag-dropdown .ant-select-item-option-selected {
          background-color: rgba(99, 102, 241, 0.15) !important;
          color: #818cf8 !important;
        }
      `}</style>
      
      <Select
        mode="multiple"
        allowClear
        loading={isLoading}
        value={normalizedValue}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        className="w-full custom-tag-select"
        popupClassName="tag-dropdown"
        popupMatchSelectWidth={false}
      />
    </div>
  );
}
