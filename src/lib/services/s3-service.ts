import { convertHeicToWebp } from "../utils/media-utils";
import { configApi } from "../api/config";

class S3Service {
    private bucketName: string | null = null;
    private region: string | null = null;
    private activeUploads: Map<string, any> = new Map();
    private initPromise: Promise<void> | null = null;

    async init() {
        if (this.bucketName) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                const { data: config } = await configApi.getMediaConfig();
                this.bucketName = config.bucketName;
                this.region = config.region;
            } catch (error) {
                this.initPromise = null;
                console.error("Failed to initialize S3 Service config:", error);
            }
        })();

        return this.initPromise;
    }

    async uploadFile(
        file: File,
        key: string,
        onProgress?: (progress: number) => void,
        customId?: string
    ) {
        let finalFile = file;
        let finalKey = key;
        const trackingId = customId || finalKey;

        // Multi-level HEIC check
        const fileName = (file as File).name?.toLowerCase() || "unknown";
        const isHeic = file.type === "image/heic" ||
            file.type === "image/heif" ||
            fileName.endsWith(".heic") ||
            fileName.endsWith(".heif");

        if (isHeic) {
            try {
                console.log(`[S3Service] Converting HEIC: ${fileName}`);
                finalFile = await convertHeicToWebp(file);
                finalKey = finalKey.replace(/\.(heic|heif)$/i, ".webp");
                if (!finalKey.endsWith(".webp")) finalKey += ".webp";
                console.log(`[S3Service] Conversion success: ${finalKey}`);
            } catch (err) {
                console.warn(`[S3Service] Conversion failed for ${fileName}, using original`, err);
            }
        }

        const uploadStart = performance.now();
        console.log(`[S3Service] Starting Direct S3 Upload: ${finalKey} (${(finalFile.size / 1024).toFixed(1)} KB)`);

        return new Promise(async (resolve, reject) => {
            try {
                // 1. Get Presigned URL from Backend
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3019/api";
                const cookies = document.cookie.split(';').map(c => c.trim());
                const tokenCookie = cookies.find(c => c.startsWith('accessToken='));
                const token = tokenCookie ? tokenCookie.split('=')[1] : null;

                const presignedUrlRes = await fetch(`${API_URL}/media/presigned-url?key=${encodeURIComponent(finalKey)}&mimeType=${encodeURIComponent(finalFile.type)}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!presignedUrlRes.ok) {
                    throw new Error(`Failed to get presigned URL: ${presignedUrlRes.statusText}`);
                }

                const { url: presignedUrl } = await presignedUrlRes.json();

                // 2. Upload Direct to S3
                const xhr = new XMLHttpRequest();

                if (onProgress) {
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            onProgress(Math.round((e.loaded / e.total) * 100));
                        }
                    };
                }

                xhr.open('PUT', presignedUrl);
                xhr.setRequestHeader('Content-Type', finalFile.type);

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const duration = ((performance.now() - uploadStart) / 1000).toFixed(2);
                        console.log(`[S3Service] Direct S3 Upload SUCCESS: ${finalKey} in ${duration}s`);
                        if (onProgress) onProgress(100);
                        resolve({ key: finalKey });
                    } else {
                        reject(new Error(`S3 Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error("Network Error during S3 Upload"));
                xhr.onabort = () => reject(new Error("AbortError"));

                xhr.send(finalFile);

                this.activeUploads.set(trackingId, { abort: () => { xhr.abort(); } });
            } catch (err) {
                reject(err);
            }
        }).finally(() => {
            this.activeUploads.delete(trackingId);
        });
    }

    cancelUpload(key: string) {
        const upload = this.activeUploads.get(key);
        if (upload) {
            try {
                upload.abort();
            } catch (err) {
                // AbortError is expected when canceling
                console.log("[S3Service] Upload aborted intentionally");
            }
            this.activeUploads.delete(key);
            return true;
        }
        return false;
    }

    getPublicUrl(key: string | undefined | null) {
        if (!key) return null;
        const cloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
        if (cloudfrontUrl) {
            return `${cloudfrontUrl}/${key}`;
        }
        // Fallback for development if env is missing
        this.init(); // background trigger
        if (!this.bucketName || !this.region) {
            // Predict URL structure if config not loaded yet
            return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || 'solid-app-maker'}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
        }
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    async deleteFile(key: string) {
        // Obsolete in frontend, backend handles S3 deletions via DELETE /media/:id
        console.log("[S3Service] File deletion requested locally, but backend will handle actual S3 removal.");
        return true;
    }
}

export const s3Service = new S3Service();
