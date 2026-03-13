"use client";

import React from "react";
import { Modal } from "antd";
import MediaLibraryView from "@/components/media/MediaLibraryView";

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    title?: string;
}

/**
 * MediaPicker — A modal wrapper for MediaLibraryView to be used within the editor.
 */
export default function MediaPicker({ open, onClose, onSelect, title = "Select Media" }: MediaPickerProps) {
    return (
        <Modal
            title={<span style={{ color: "var(--text)", fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            styles={{
                header: {
                    background: "transparent",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: 20,
                    paddingBottom: 12,
                },
                body: {
                    maxHeight: "70vh",
                    overflowY: "auto",
                    padding: 0,
                },
                mask: {
                    backdropFilter: "blur(4px)",
                    background: "rgba(0, 0, 0, 0.4)",
                }
            }}
            style={{
                background: "var(--bg-secondary)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
            }}
            closeIcon={<span style={{ color: "var(--text-muted)" }}>×</span>}
        >
            <div className="media-picker-content">
                <MediaLibraryView 
                    hideBatchActions={true}
                    onSelect={(url) => {
                        onSelect(url);
                        onClose();
                    }} 
                />
            </div>
            
            <style jsx global>{`
                .media-picker-content .ant-input {
                    background: var(--bg-primary) !important;
                    border: 1px solid var(--border) !important;
                    color: var(--text) !important;
                }
                .media-picker-content .ant-input-prefix {
                    color: var(--text-muted) !important;
                }
            `}</style>
        </Modal>
    );
}
