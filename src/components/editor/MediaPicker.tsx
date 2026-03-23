"use client";

import React from "react";
import { Modal } from "antd";
import MediaLibraryView from "@/components/media/MediaLibraryView";

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (urls: string[]) => void;
    title?: string;
    type?: 'all' | 'image' | 'video';
    multiple?: boolean;
}

/**
 * MediaPicker — A modal wrapper for MediaLibraryView to be used within the editor.
 */
export default function MediaPicker({ 
    open, 
    onClose, 
    onSelect, 
    title = "Select Media", 
    type = "all",
    multiple = false
}: MediaPickerProps) {
    return (
        <Modal
            title={<span style={{ color: "var(--text)", fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>}
            open={open}
            onCancel={onClose}
            mask={{ closable: true }}
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
                    maxHeight: "75vh",
                    overflowY: "auto",
                    padding: 0,
                },
                mask: {
                    backdropFilter: "blur(4px)",
                    background: "rgba(0, 0, 0, 0.4)",
                    zIndex: 1000,
                }
            }}
            style={{
                background: "var(--bg-secondary)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
                zIndex: 1001,
            }}
            closeIcon={<span style={{ color: "var(--text-muted)", fontSize: 24 }}>×</span>}
        >
            <div className="media-picker-content">
                <MediaLibraryView 
                    hideBatchActions={!multiple}
                    initialType={type}
                    multiple={multiple}
                    onSelect={(urlOrUrls) => {
                        if (multiple) {
                            onSelect(Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls]);
                        } else {
                            const singleUrl = Array.isArray(urlOrUrls) ? urlOrUrls[0] : urlOrUrls;
                            onSelect([singleUrl]);
                        }
                        // Using a micro-task delay to ensure state updates in the parent flow through before modal closes
                        setTimeout(() => onClose(), 10);
                    }} 
                />
            </div>
        </Modal>
    );
}
