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
    isPublic: boolean;
}

export function useMediaUpload(onSelect?: (url: string) => void) {
    const [files, setFiles] = useState<MediaUploadFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const toasts = useToasts();
    const createMediaMut = useCreateMediaMutation();

    const addFiles = useCallback((newFiles: File[]) => {
        const mapped = newFiles.map((f, index) => {
            const previewUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
            return {
                id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                file: f,
                status: 'idle' as const,
                progress: 0,
                previewUrl,
                isPublic: true
            };
        });
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
                    mimeType: mediaFile.file.type,
                    size: mediaFile.file.size,
                    isPublic: true
                });
            }

            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'completed', url: url || '' } : f));
            if (onSelect && url) onSelect(url);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log(`[useMediaUpload] Upload ${mediaFile.id} aborted`);
                return;
            }
            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'error' } : f));
            toasts.error(`Failed to upload ${mediaFile.file.name}`);
        }
    }, [createMediaMut, onSelect, toasts, updateProgress]);

    const handleBulkUpload = useCallback(async () => {
        const filesToUpload = files.filter(f => f.status === 'idle' || f.status === 'error');
        if (filesToUpload.length === 0) return;

        setFiles(prev => prev.map(f => filesToUpload.some(u => u.id === f.id) ? { ...f, status: 'uploading' } : f));

        await Promise.all(filesToUpload.map(async (mediaFile) => {
            await handleUpload(mediaFile);
        }));
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
