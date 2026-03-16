"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Modal } from "antd";
import {
  CameraIcon,
  CheckCircleIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { s3Service } from "@/lib/services/s3-service";

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

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

  const capturePreview = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) {
      setCaptureError("Preview not ready.");
      return;
    }

    setIsCapturing(true);
    setCaptureError(null);
    setUploadProgress(0);

    try {
      const { toPng } = await import("html-to-image");
      setUploadProgress(10);

      const scale = 2;
      const captureOptions: any = {
        quality: 1,
        pixelRatio: scale,
        cacheBust: true,
        skipFonts: true,
      };

      let sourceNode: HTMLElement | null = null;

      if (viewMode === "mobile") {
        // Capture the container to get the phone frame/mockup look
        sourceNode = containerRef.current;
      } else {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) throw new Error("Preview content inaccessible.");
        sourceNode = iframeDoc.documentElement || iframeDoc.body;
      }

      if (!sourceNode) throw new Error("Source for capture not found.");

      const dataUrl = await toPng(sourceNode, captureOptions);

      setUploadProgress(60);
      const fetchRes = await fetch(dataUrl);
      const blob = await fetchRes.blob();
      const filename = `thumb-${pageId}-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      await s3Service.init();
      const key = `thumbnails/${pageId}/${filename}`;
      await s3Service.uploadFile(file, key);
      const publicUrl = (await s3Service.getPublicUrl(key)) as string;

      setUploadProgress(90);
      const newThumbnails = [...thumbnails, publicUrl];
      setThumbnails(newThumbnails);
      setActiveThumbnail(publicUrl);
      onSelect(publicUrl);
      onUpdateThumbnails(newThumbnails, publicUrl);

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1500);
    } catch (err: any) {
      setCaptureError(`Capture failed: ${err.message}`);
    } finally {
      setIsCapturing(false);
    }
  }, [pageId, thumbnails, onSelect, onUpdateThumbnails, viewMode]);

  const handleSetActive = useCallback((url: string) => {
    setActiveThumbnail(url);
    onSelect(url);
    onUpdateThumbnails(thumbnails, url);
  }, [thumbnails, onSelect, onUpdateThumbnails]);

  const handleDelete = useCallback((url: string) => {
    if (thumbnails.length <= 1) return; // Prevent deleting the last thumbnail

    const newThumbnails = thumbnails.filter((t) => t !== url);
    setThumbnails(newThumbnails);
    const newActive = activeThumbnail === url ? (newThumbnails[newThumbnails.length - 1] ?? null) : activeThumbnail;
    setActiveThumbnail(newActive);
    onUpdateThumbnails(newThumbnails, newActive);
    if (activeThumbnail === url && newActive) onSelect(newActive);
  }, [thumbnails, activeThumbnail, onSelect, onUpdateThumbnails]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ top: 0, padding: 0, maxWidth: "100%", height: "100vh" }}
      bodyStyle={{ height: "calc(100vh - 60px)", padding: "20px" }}
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
          
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
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
      }
      className="[&_.ant-modal-content]:bg-[#0c0c0e] [&_.ant-modal-content]:border-none [&_.ant-modal-content]:rounded-none [&_.ant-modal-header]:bg-transparent [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-white/5 [&_.ant-modal-close]:text-white/40 [&_.ant-modal-close]:top-[18px]"
    >
      <div style={{ display: "flex", gap: 32, height: "100%" }}>

        {/* Left: Enhanced Live Preview */}
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
              
              {/* Unified Viewport Wrapper */}
              <div 
                ref={containerRef}
                style={{
                  width: viewMode === "desktop" ? "100%" : 375, height: viewMode === "desktop" ? "100%" : 667,
                  maxWidth: "100%", maxHeight: "100%", position: "relative",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.8)",
                  borderRadius: viewMode === "mobile" ? 36 : 4,
                  border: viewMode === "mobile" ? "14px solid #1a1a1c" : "1px solid rgba(255,255,255,0.05)",
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

          {/* New Floating Control Center */}
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
                    CAPTURE FULL FRAME
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

        {/* Right Gallery */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.9)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Studio Assets
            </h3>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{thumbnails.length} verified captures</p>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 8 }} className="custom-scroll">
            {thumbnails.length === 0 ? (
              <div style={{
                height: 200, borderRadius: 20, border: "2px dashed rgba(255,255,255,0.03)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 12, color: "rgba(255,255,255,0.1)",
              }}>
                <div style={{ opacity: 0.5 }}><ArrowsPointingOutIcon style={{ width: 40, height: 40 }} /></div>
                <span style={{ fontSize: 11, fontWeight: 600 }}>NO ASSETS CAPTURED</span>
              </div>
            ) : (
              [...thumbnails].reverse().map((url) => (
                <div
                  key={url}
                  className="proof-card"
                  style={{
                    position: "relative", borderRadius: 16, overflow: "hidden",
                    border: activeThumbnail === url ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "#000", 
                    boxShadow: activeThumbnail === url ? "0 10px 30px rgba(99,102,241,0.2)" : "none",
                    width: (url.includes("thumb") && !url.includes("desktop")) || url.includes("mobile") ? 100 : "100%",
                    height: 140,
                    margin: "0 auto"
                  }}
                  onClick={() => handleSetActive(url)}
                >
                  <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                  }}>
                    <img src={url} alt="Proof" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", opacity: activeThumbnail === url ? 1 : 0.6, transition: "opacity 0.3s" }} />
                  </div>
                  {activeThumbnail === url && (
                    <div style={{ position: "absolute", top: 8, left: 8, background: "#6366f1", borderRadius: 6, padding: "2px 6px", fontSize: 8, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 3, zIndex: 10 }}>
                      <CheckCircleSolid style={{ width: 10, height: 10 }} /> ACTIVE
                    </div>
                  )}
                  <div className="proof-overlay" style={{ position: "absolute", inset: 0, background: "rgba(99,102,241,0.2)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
                    <div style={{ background: "#6366f1", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>SELECT</div>
                  </div>
                  <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6, opacity: 0, transition: "all 0.2s", transform: "translateY(10px)", zIndex: 10 }} className="proof-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(url); }} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.9)", backdropFilter: "blur(10px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <TrashIcon style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 24, padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase" }}>Pro Tip</h4>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, margin: 0 }}>
              Toggle between <strong>Desktop</strong> and <strong>Mobile</strong> views to ensure your project looks great across all devices.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
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
