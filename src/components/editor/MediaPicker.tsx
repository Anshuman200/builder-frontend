"use client";

import { ConfigProvider, theme as antdTheme, Modal } from "antd";
import MediaLibraryView from "@/components/media/MediaLibraryView";
import { PANEL_COLORS } from "../editor/panels/shared";

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
        <ConfigProvider
            theme={{
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: PANEL_COLORS.primary,
                    colorBgContainer: PANEL_COLORS.inputBg,
                    colorBorder: PANEL_COLORS.border,
                    colorText: PANEL_COLORS.text,
                    colorTextDescription: PANEL_COLORS.muted,
                    colorBgElevated: PANEL_COLORS.sectionBg,
                    borderRadius: 12,
                }
            }}
        >
            <Modal
                title={<span style={{ color: PANEL_COLORS.text, fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>}
                open={open}
                onCancel={onClose}
                mask={{ closable: true }}
                footer={null}
                width={1040}
                centered
                zIndex={2000}
                styles={{
                    header: {
                        background: "transparent",
                        borderBottom: `1px solid ${PANEL_COLORS.border}`,
                        marginBottom: 20,
                        paddingBottom: 12,
                    },
                    body: {
                        maxHeight: "75vh",
                        overflowY: "auto",
                        padding: 0,
                    },
                }}
                className="dark"
                style={{
                    background: PANEL_COLORS.bg,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${PANEL_COLORS.border}`,
                    color: PANEL_COLORS.text
                }}
                closeIcon={<span style={{ color: PANEL_COLORS.muted, fontSize: 24 }}>×</span>}
            >
                <div className="media-picker-content">
                    <MediaLibraryView
                        hideBatchActions={!multiple}
                        initialType={type}
                        multiple={multiple}
                        onSelect={(urlOrUrls) => {
                            onClose();
                            if (multiple) {
                                onSelect(Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls]);
                            } else {
                                const singleUrl = Array.isArray(urlOrUrls) ? urlOrUrls[0] : urlOrUrls;
                                onSelect([singleUrl]);
                            }
                        }}
                    />
                </div>
            </Modal>
        </ConfigProvider>
    );
}
