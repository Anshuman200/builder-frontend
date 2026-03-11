"use client";

import { XMarkIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Modal, Button } from "antd";

interface Props {
    pageId: string;
    pageTitle?: string;
    onClose: () => void;
}

export function TemplatePreviewModal({ pageId, pageTitle, onClose }: Props) {
    const previewUrl = `/preview/${pageId}`;

    return (
        <Modal
            open
            onCancel={onClose}
            footer={null}
            closeIcon={null}
            width="100%"
            style={{ maxWidth: 1024, padding: 0 }}
            centered
            styles={{
                body: { padding: 0, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '90vh' }
            }}
        >
            <div className="flex flex-col h-full rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-(--border) shrink-0 bg-(--surface)">
                    <div className="flex items-center gap-2 min-w-0">
                        <GlobeAltIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-bold text-sm text-(--text) truncate m-0">
                            {pageTitle || "Template Preview"}
                        </span>
                        <code className="text-xs text-(--text-muted) bg-(--bg) border border-(--border) px-2 py-0.5 rounded-md hidden sm:block">
                            {previewUrl}
                        </code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button type="default" size="small" style={{ color: "var(--indigo-400)", borderColor: "rgba(129, 140, 248, 0.3)" }} href={previewUrl} target="_blank" rel="noopener noreferrer">
                            Open in tab
                        </Button>
                        <Button type="text" size="small" icon={<XMarkIcon className="w-4 h-4" />} className="text-(--text-muted) hover:bg-(--bg)" onClick={onClose} />
                    </div>
                </div>

                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-2 bg-(--bg) border-b border-(--border) shrink-0">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/70" />
                        <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                    </div>
                    <div className="flex-1 bg-(--surface) border border-(--border) rounded-md px-3 py-1 text-xs text-(--text-muted) font-mono">
                        {typeof window !== "undefined" ? `${window.location.origin}${previewUrl}` : previewUrl}
                    </div>
                </div>

                {/* Iframe */}
                <div className="flex-1 overflow-hidden bg-white">
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-none"
                        title="Template Preview"
                    />
                </div>
            </div>
        </Modal>
    );
}
