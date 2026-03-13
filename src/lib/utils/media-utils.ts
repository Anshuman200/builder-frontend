import html2canvas from "html2canvas";

/**
 * Converts HEIC/HEIF files to WebP.
 * Requires 'heic2any' package.
 */
export async function convertHeicToWebp(file: File | Blob): Promise<File> {
    try {
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({
            blob: file,
            toType: "image/webp",
            quality: 0.8
        });
        const blobArray = Array.isArray(blob as any) ? (blob as any)[0] : blob;
        const newName = (file as File).name ? (file as File).name.replace(/\.[^.]+$/, ".webp") : "converted.webp";
        
        return new File([blobArray as any], newName, {
            type: "image/webp",
        });
    } catch (error) {
        console.error("Error converting HEIC to WebP:", error);
        throw error;
    }
}

/**
 * Captures a thumbnail from a video file at 1 second mark.
 */
export async function captureVideoThumbnail(videoFile: File | Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(videoFile);
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;

        const cleanup = () => {
            URL.revokeObjectURL(video.src);
            video.remove();
        };

        video.addEventListener("loadeddata", () => {
            video.currentTime = 1;
        });

        video.addEventListener("seeked", () => {
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    cleanup();
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to capture thumbnail"));
                }, "image/jpeg", 0.8);
            } else {
                cleanup();
                reject(new Error("Failed to get canvas context"));
            }
        });

        video.addEventListener("error", () => {
            cleanup();
            reject(new Error("Failed to load video for thumbnail"));
        });
    });
}

/**
 * Captures a screenshot of a DOM element.
 */
export async function captureScreenshot(element: HTMLElement): Promise<Blob> {
    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2, // Higher resolution
            backgroundColor: null,
        });
        
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to generate screenshot blob"));
            }, "image/png");
        });
    } catch (error) {
        console.error("Error capturing screenshot:", error);
        throw error;
    }
}

/**
 * Validates if a file is an image or video based on extension/type.
 */
export function isMediaFile(file: File) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    
    return validImageTypes.includes(file.type) || validVideoTypes.includes(file.type);
}

/**
 * Formats file size to human readable string.
 */
export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
