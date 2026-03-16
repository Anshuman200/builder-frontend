import { useState, useCallback } from "react";
import { s3Service } from "@/lib/services/s3-service";
import { useCreateMediaMutation } from "@/hooks/useMedia";
import { useToasts } from "@/hooks/useToasts";

export interface MediaUploadFile {
    id: string;
    file: File;
    status: 'idle' | 'editing' | 'processing' | 'uploading' | 'completed' | 'error';
    progress: number;
    url?: string;
    previewUrl?: string;
    placeholder?: string;
    isPublic: boolean;
}

const generatePlaceholder = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const size = 20; // 20px for blurry placeholder
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                ctx?.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.src = URL.createObjectURL(file);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            
            const cleanup = () => {
                video.pause();
                video.src = "";
                video.load();
                video.remove();
            };

            const timeout = setTimeout(() => {
                cleanup();
                resolve("");
            }, 5000);

            video.onloadeddata = () => {
                video.currentTime = 0.1; // Seek slightly in to avoid black frames
            };

            video.onseeked = () => {
                clearTimeout(timeout);
                try {
                    ctx?.drawImage(video, 0, 0, size, size);
                    resolve(canvas.toDataURL('image/jpeg', 0.5));
                } catch (e) {
                    resolve("");
                }
                cleanup();
            };

            video.onerror = () => {
                clearTimeout(timeout);
                cleanup();
                resolve("");
            };

            video.src = URL.createObjectURL(file);
        } else {
            resolve("");
        }
    });
};

export function useMediaUpload(onSelect?: (url: string) => void) {
    const [files, setFiles] = useState<MediaUploadFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const toasts = useToasts();
    const createMediaMut = useCreateMediaMutation();

    const addFiles = useCallback(async (newFiles: File[]) => {
        const mapped = await Promise.all(newFiles.map(async (f, index) => {
            const previewUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
            const placeholder = await generatePlaceholder(f);
            return {
                id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                file: f,
                status: 'idle' as const,
                progress: 0,
                previewUrl,
                placeholder,
                isPublic: true
            };
        }));
        setFiles(prev => [...prev, ...mapped]);
    }, []);

    const updateProgress = useCallback((id: string, progress: number) => {
        setUploadProgress(prev => {
            const current = prev[id] || 0;
            if (progress > current) {
                return { ...prev, [id]: progress };
            }
            return prev;
        });
    }, []);

    const handleUpload = useCallback(async (mediaFile: MediaUploadFile) => {
        setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'uploading' } : f));

        try {
            const timestamp = Date.now();
            const entropy = Math.random().toString(36).substring(2, 10);
            const safeName = mediaFile.file.name.replace(/\s+/g, '_');
            const key = `uploads/${timestamp}_${entropy}_${safeName}`;

            console.log(`[useMediaUpload] Upload Start: ${mediaFile.id} -> ${key}`);

            const uploadResult = await s3Service.uploadFile(mediaFile.file, key, (progress) => {
                updateProgress(mediaFile.id, progress);
            }, mediaFile.id);

            const url = s3Service.getPublicUrl((uploadResult as any).key);

            if (url) {
                await createMediaMut.mutateAsync({
                    name: mediaFile.file.name,
                    key: (uploadResult as any).key,
                    thumbnailKey: (uploadResult as any).thumbnailKey,
                    placeholder: mediaFile.placeholder,
                    mimeType: mediaFile.file.type,
                    size: mediaFile.file.size,
                    isPublic: true
                });
            }

            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'completed', url: url || '' } : f));
            if (onSelect && url) onSelect(url);
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message === 'AbortError') {
                console.log(`[useMediaUpload] Upload ${mediaFile.id} aborted`);
                return;
            }
            console.error(`[useMediaUpload] Upload failed for ${mediaFile.id}:`, err);
            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'error' } : f));
            toasts.error(`Failed to upload ${mediaFile.file.name}`);
        }
    }, [createMediaMut, onSelect, toasts, updateProgress]);

    const handleBulkUpload = useCallback(async () => {
        const filesToUpload = files.filter(f => f.status === 'idle' || f.status === 'error');
        if (filesToUpload.length === 0) return;

        // Process files in batches (concurrency of 3) to balance speed and reliability
        const CONCURRENCY = 10;
        const queue = [...filesToUpload];
        const workers = Array(Math.min(CONCURRENCY, queue.length)).fill(null).map(async () => {
            while (queue.length > 0) {
                const file = queue.shift();
                if (file) await handleUpload(file);
            }
        });

        await Promise.all(workers);
    }, [files, handleUpload]);

    const handleCancel = useCallback((mediaFile: MediaUploadFile) => {
        s3Service.cancelUpload(mediaFile.id);
        if (mediaFile.previewUrl) {
            URL.revokeObjectURL(mediaFile.previewUrl);
        }
        setUploadProgress(prev => {
            const next = { ...prev };
            delete next[mediaFile.id];
            return next;
        });
        setFiles(prev => prev.filter(f => f.id !== mediaFile.id));
    }, []);

    const clearCompleted = useCallback(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
    }, []);

    return {
        files,
        setFiles,
        uploadProgress,
        addFiles,
        handleUpload,
        handleBulkUpload,
        handleCancel,
        clearCompleted
    };
}
