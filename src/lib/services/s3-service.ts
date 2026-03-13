import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { Upload } from "@aws-sdk/lib-storage";
import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";
import moment from "moment";
import { configApi } from "../api/config";
import { convertHeicToWebp, captureVideoThumbnail } from "../utils/media-utils";

class S3Service {
    private client: S3Client | null = null;
    private bucketName: string | null = null;
    private region: string | null = null;
    private activeUploads: Map<string, Upload> = new Map();
    private initPromise: Promise<void> | null = null;

    async init() {
        if (this.client) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                const { data: config } = await configApi.getMediaConfig();
                this.bucketName = config.bucketName;
                this.region = config.region;

                this.client = new S3Client({
                    region: config.region,
                    requestHandler: new XhrHttpHandler({}),
                    credentials: fromCognitoIdentityPool({
                        identityPoolId: config.identityPoolId,
                        clientConfig: { region: config.region },
                    }),
                    requestChecksumCalculation: "WHEN_REQUIRED",
                    responseChecksumValidation: "WHEN_REQUIRED",
                });
            } catch (error) {
                this.initPromise = null;
                console.error("Failed to initialize S3 Service:", error);
                throw error;
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
        await this.init();
        if (!this.client || !this.bucketName) throw new Error("S3 Service not initialized");

        let finalFile = file;
        let finalKey = key;
        const trackingId = customId || finalKey;
        let thumbnailKey: string | undefined;

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
        console.log(`[S3Service] Starting Upload: ${finalKey} (${(finalFile.size / 1024).toFixed(1)} KB)`);

        // OPTIMIZATION: Use direct PutObject for files up to 10MB to minimize multipart overhead
        // 10MB is a sweet spot for single-request reliability vs session overhead
        if (finalFile.size < 10 * 1024 * 1024) {
            try {
                const command = new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: finalKey,
                    Body: finalFile,
                    ContentType: finalFile.type || "application/octet-stream",
                });
                
                const result = await this.client.send(command);
                const duration = ((performance.now() - uploadStart) / 1000).toFixed(2);
                console.log(`[S3Service] Direct Upload SUCCESS: ${finalKey} in ${duration}s`);
                
                if (onProgress) onProgress(100);
                return { ...result, key: finalKey };
            } catch (error) {
                console.error("[S3Service] Direct upload failed, falling back to Upload manager", error);
            }
        }

        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucketName,
                Key: finalKey,
                Body: finalFile,
                ContentType: finalFile.type || "application/octet-stream",
            },
            queueSize: 4, // Increase concurrency for faster uploads
            partSize: 5 * 1024 * 1024,
            leavePartsOnError: false,
        });

        this.activeUploads.set(trackingId, upload);

        // Start video thumbnail generation early (off main upload thread)
        let thumbnailPromise: Promise<Blob> | null = null;
        if (file.type.startsWith("video/")) {
            thumbnailPromise = captureVideoThumbnail(file).catch(err => {
                console.warn("[S3Service] Thumbnail generation failed early:", err);
                return null;
            }) as any;
        }

        const totalSize = finalFile.size;
        upload.on("httpUploadProgress", (progress) => {
            if (onProgress && progress.loaded) {
                const percentage = Math.min(99, Math.round((progress.loaded / totalSize) * 100));
                onProgress(percentage);
            }
        });

        try {
            const result = await upload.done();
            const duration = ((performance.now() - uploadStart) / 1000).toFixed(2);
            console.log(`[S3Service] Multipart Upload SUCCESS: ${finalKey} in ${duration}s`);
            
            this.activeUploads.delete(trackingId);

            // Handle Video Thumbnail Upload
            if (thumbnailPromise) {
                try {
                    const thumbnailBlob = await thumbnailPromise;
                    if (thumbnailBlob) {
                        const timestamp = moment().format("YYYYMMDD_HHmmss");
                        const uniqueId = Math.random().toString(36).substring(2, 8);
                        thumbnailKey = `thumbnails/${timestamp}_${uniqueId}_thumbnail.jpg`;

                        const thumbUpload = new Upload({
                            client: this.client,
                            params: {
                                Bucket: this.bucketName,
                                Key: thumbnailKey,
                                Body: thumbnailBlob,
                                ContentType: "image/jpeg",
                            }
                        });
                        await thumbUpload.done();
                    }
                } catch (err) {
                    console.error("Failed to upload video thumbnail:", err);
                }
            }

            if (onProgress) onProgress(100); 
            return { ...result, key: finalKey, thumbnailKey };
        } catch (error) {
            this.activeUploads.delete(trackingId);
            throw error;
        }
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

    getPublicUrl(key: string) {
        const cloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
        if (cloudfrontUrl) {
            return `${cloudfrontUrl}/${key}`;
        }
        // Fallback for development if env is missing
        if (!this.bucketName || !this.region) return null;
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    async deleteFile(key: string) {
        await this.init();
        if (!this.client || !this.bucketName) throw new Error("S3 Service not initialized");

        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.client.send(command);
            return true;
        } catch (error) {
            console.error("Failed to delete file from S3:", error);
            throw error;
        }
    }
}

export const s3Service = new S3Service();
