"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Image, Modal } from "antd";
import {
  CameraIcon,
  TrashIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { s3Service } from "@/lib/services/s3-service";
import { useToasts } from "@/hooks/useToasts";

interface CapturePreviewModalProps {
  open: boolean;
  onClose: () => void;
  pageId: string;
  previewUrl: string;
  currentThumbnail: string | null;
  existingThumbnails: string[];
  onSelect: (url: string) => void;
  onUpdateThumbnails: (thumbnails: string[], active: string | null) => void;
}

type ViewMode = "desktop" | "mobile";

export default function CapturePreviewModal({
  open,
  onClose,
  pageId,
  previewUrl,
  currentThumbnail,
  existingThumbnails,
  onSelect,
  onUpdateThumbnails,
}: CapturePreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>(existingThumbnails || []);
  const [activeThumbnail, setActiveThumbnail] = useState<string | null>(currentThumbnail);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const toasts = useToasts();

  useEffect(() => {
    setThumbnails(existingThumbnails || []);
    setActiveThumbnail(currentThumbnail);
  }, [existingThumbnails, currentThumbnail]);

  const capturePreview = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) {
      setCaptureError("Preview not ready.");
      return;
    }

    if (thumbnails.length >= 4) {
      toasts.error("Maximum 4 screenshots allowed per template.");
      return;
    }

    setIsCapturing(true);
    setCaptureError(null);
    setUploadProgress(0);

    try {
      const { toPng } = await import("html-to-image");
      setUploadProgress(10);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (!iframeDoc || !iframeDoc.body) throw new Error("Preview content inaccessible.");

      const scale = 2;
      const captureOptions: any = {
        quality: 1,
        pixelRatio: scale,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: '#ffffff',
        // Fallback for broken images (avoids capture failure if an external image is 404/DNS error)
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      };

      // Target the iframe content directly - this is most reliable for "Visible Area" captures
      const sourceNode = iframeDoc.documentElement || iframeDoc.body;
      
      // Explicitly set width/height to match the visible viewport
      captureOptions.width = iframe.clientWidth;
      captureOptions.height = iframe.clientHeight;

      const scrollY = iframe.contentWindow?.scrollY || 0;
      const scrollX = iframe.contentWindow?.scrollX || 0;

      captureOptions.style = {
        transform: `translate(-${scrollX}px, -${scrollY}px)`,
        transformOrigin: 'top left',
        width: `${iframeDoc.documentElement.scrollWidth}px`,
        height: `${iframeDoc.documentElement.scrollHeight}px`,
      };

      // Hide scrollbars for capture
      const style = iframeDoc.createElement('style');
      style.id = "capture-temp-styles";
      style.innerHTML = `
        ::-webkit-scrollbar { display: none !important; }
        body { transition: none !important; }
      `;
      iframeDoc.head.appendChild(style);

      // Let Styles settle
      await new Promise(r => setTimeout(r, 300));

      try {
        const dataUrl = await toPng(sourceNode, captureOptions);
        style.remove();

        if (!dataUrl) throw new Error("Generated image is empty.");

        setUploadProgress(40);
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });

        setUploadProgress(60);
        const res = await s3Service.uploadFile(file, `thumbnails/${pageId}/${Date.now()}.png`) as { key: string };
        const url = s3Service.getPublicUrl(res.key);

        if (!url) throw new Error("Failed to resolve public URL.");

        const newThumbnails = [...thumbnails, url];
        setThumbnails(newThumbnails);
        setActiveThumbnail(url);
        onUpdateThumbnails(newThumbnails, url);
        onSelect(url);

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      } catch (e) {
        style.remove();
        throw e;
      }
    } catch (err: any) {
      console.error("[STUDIO CAPTURE ERROR]", err);
      // Robust error reporting to catch non-standard error objects
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
      setCaptureError(`Capture failed: ${errorMessage || "Unknown Error"}`);
    } finally {
      setIsCapturing(false);
    }
  }, [pageId, thumbnails, onSelect, onUpdateThumbnails, toasts]);

  const handleSetActive = useCallback((url: string) => {
    setActiveThumbnail(url);
    onSelect(url);
    onUpdateThumbnails(thumbnails, url);
  }, [thumbnails, onSelect, onUpdateThumbnails]);

  const handleDelete = useCallback((url: string) => {
    if (thumbnails.length <= 1) {
      toasts.info("At least one thumbnail is required.");
      return;
    }

    const newThumbnails = thumbnails.filter((t) => t !== url);
    setThumbnails(newThumbnails);
    const newActive = activeThumbnail === url ? (newThumbnails[newThumbnails.length - 1] ?? null) : activeThumbnail;
    setActiveThumbnail(newActive);
    onUpdateThumbnails(newThumbnails, newActive);
    if (activeThumbnail === url && newActive) onSelect(newActive);
  }, [thumbnails, activeThumbnail, onSelect, onUpdateThumbnails, toasts]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ top: 0, padding: 0, maxWidth: "100%", height: "100vh" }}
      bodyStyle={{ height: "calc(100vh - 90px)", padding: "20px" }}
      centered
      destroyOnHidden
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 8, padding: 6 }}>
              <CameraIcon style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>Studio Capture</span>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500, marginTop: -2 }}>PREMIUM THUMBNAIL ENGINE</div>
            </div>
          </div>
          
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: 5 }}>
            <div className="" style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => setViewMode("desktop")}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8,
                  background: viewMode === "desktop" ? "rgba(99,102,241,0.15)" : "transparent",
                  color: viewMode === "desktop" ? "#818cf8" : "rgba(255,255,255,0.4)",
                  border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s"
                }}
              >
                <ComputerDesktopIcon style={{ width: 14, height: 14 }} />
                Desktop
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8,
                  background: viewMode === "mobile" ? "rgba(99,102,241,0.15)" : "transparent",
                  color: viewMode === "mobile" ? "#818cf8" : "rgba(255,255,255,0.4)",
                  border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s"
                }}
              >
                <DevicePhoneMobileIcon style={{ width: 14, height: 14 }} />
                Mobile
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 'auto', marginRight: 16 }}>
            <div style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              maxWidth: 400,
              padding: '4px 0'
            }} className="custom-scroll horizontal-scroll">
              {thumbnails.map((url) => (
                <div
                  key={url}
                  className="proof-card"
                  onClick={() => handleSetActive(url)}
                  style={{
                    flex: "0 0 70px",
                    height: 34,
                    position: "relative", borderRadius: 6, overflow: "hidden",
                    border: activeThumbnail === url ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer", transition: "all 0.2s",
                    background: "#000",
                  }}
                >
                  <Image src={url} alt="Proof" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: activeThumbnail === url ? 1 : 0.5 }} />
                  <div className="proof-actions" style={{ position: "absolute", top: 0, right: 0, opacity: 0, transition: 'opacity 0.2s' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(url); }} style={{ width: 16, height: 16, background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrashIcon style={{ width: 10, height: 10 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: 'nowrap' }}>{thumbnails.length}/4 Assets</span>
          </div>
        </div>
      }
      className="[&_.ant-modal-content]:bg-[#0c0c0e] [&_.ant-modal-content]:border-none [&_.ant-modal-content]:rounded-none [&_.ant-modal-header]:bg-transparent [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-white/5 [&_.ant-modal-close]:text-white/40 [&_.ant-modal-close]:top-[18px]"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%", position: 'relative' }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          <div style={{
            flex: 1,
            background: "#050505",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.04)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)"
          }}>
            <div style={{
              flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              padding: viewMode === "mobile" ? "40px" : "20px",
              background: "radial-gradient(circle at center, #111 0%, #050505 100%)",
              overflow: "hidden"
            }}>
              {!iframeLoaded && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "rgba(255,255,255,0.3)", zIndex: 10 }}>
                  <div className="loader-ring" />
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>INITIATING STUDIO...</span>
                </div>
              )}

              <div
                ref={containerRef}
                style={{
                  width: viewMode === "desktop" ? "100%" : 375, height: viewMode === "desktop" ? "100%" : 667,
                  maxWidth: "100%", maxHeight: "100%", position: "relative",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.8)",
                  borderRadius: viewMode === "mobile" ? 36 : 4,
                  border: viewMode === "mobile" ? "14px solid #1a1a1c" : "1px solid rgba(255,255,255,0.05)",
                  overflow: "hidden"
                }}>

                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  style={{
                    width: "100%", height: "100%", border: "none",
                    opacity: iframeLoaded ? 1 : 0, transition: "opacity 0.4s",
                    background: "#fff",
                  }}
                  onLoad={() => setIframeLoaded(true)}
                  sandbox="allow-scripts allow-same-origin"
                  title="Studio Preview"
                />
              </div>
            </div>
          </div>

          <div style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12
          }}>
            {uploadProgress > 0 && (
              <div style={{
                width: 240, height: 4,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 10, overflow: "hidden",
                backdropFilter: "blur(10px)"
              }}>
                <div style={{ height: "100%", width: `${uploadProgress}%`, background: "#6366f1", transition: "width 0.3s" }} />
              </div>
            )}

            <div style={{
              background: "rgba(20,20,22,0.85)",
              backdropFilter: "blur(20px)",
              padding: "8px 8px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}>
              <button
                onClick={capturePreview}
                disabled={isCapturing || !iframeLoaded}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 24px",
                  background: isCapturing ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg, #6366f1, #a855f7)",
                  color: "#fff", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 700,
                  cursor: isCapturing || !iframeLoaded ? "not-allowed" : "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isCapturing ? "none" : "0 4px 15px rgba(99,102,241,0.4)"
                }}
              >
                {isCapturing ? (
                  <>
                    <ArrowPathIcon style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <CameraIcon style={{ width: 16, height: 16 }} />
                    CAPTURE VISIBLE AREA
                  </>
                )}
              </button>

              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />

              <button
                onClick={() => {
                  setIframeLoaded(false);
                  if (iframeRef.current) iframeRef.current.src = previewUrl;
                }}
                title="Reset Viewport"
                style={{
                  width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", color: "rgba(255,255,255,0.5)", border: "none", cursor: "pointer",
                  borderRadius: 12, transition: "all 0.2s"
                }}
                className="control-icon-btn"
              >
                <ArrowPathIcon style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {captureError && (
              <div style={{
                background: "rgba(239, 68, 68, 0.9)", color: "#fff", padding: "6px 16px",
                borderRadius: 10, fontSize: 11, fontWeight: 600, boxShadow: "0 10px 20px rgba(239,68,68,0.3)"
              }}>
                {captureError}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        .horizontal-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loader-ring { width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
        .control-icon-btn:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .proof-card:hover .proof-overlay { opacity: 1 !important; }
        .proof-card:hover .proof-actions { opacity: 1 !important; transform: translateY(0) !important; }
        .ant-modal-close { transition: all 0.2s; }
        .ant-modal-close:hover { background: rgba(255,255,255,0.05); border-radius: 8px; }
      `}</style>
    </Modal>
  );
}
