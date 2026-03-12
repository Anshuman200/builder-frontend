"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
    CloudArrowUpIcon,
    XMarkIcon,
    PhotoIcon,
    DocumentIcon,
    TrashIcon,
    GlobeAltIcon,
    LockClosedIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Button, Progress, Tag, Segmented, Tooltip, Input, Modal } from "antd";
import { s3Service } from "@/lib/services/s3-service";
import MediaEditor from "./MediaEditor";
import {
    useMedia,
    useCreateMediaMutation,
    useBulkCreateMediaMutation,
    useUpdateMediaMutation,
    useDeleteMediaMutation
} from "@/hooks/useMedia";
import { useToasts } from "@/hooks/useToasts";
import { MediaRecord } from "@/lib/api/media";

interface MediaFile {
    id: string;
    file: File;
    status: 'idle' | 'editing' | 'processing' | 'uploading' | 'completed' | 'error';
    progress: number;
    url?: string;
    isPublic: boolean;
}

export default function MediaLibraryView({ onSelect }: { onSelect?: (url: string) => void }) {
    const [view, setView] = useState<'upload' | 'library'>('library');
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [editingFile, setEditingFile] = useState<MediaFile | null>(null);

    // Deletion Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

    // Multi-select State
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
    const [batchDeleteModalVisible, setBatchDeleteModalVisible] = useState(false);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);

    const toasts = useToasts();

    const { data: libraryMedia = [], isLoading: isLibraryLoading } = useMedia();
    const createMediaMut = useCreateMediaMutation();
    const bulkCreateMediaMut = useBulkCreateMediaMutation();
    const updateMediaMut = useUpdateMediaMutation();
    const deleteMediaMut = useDeleteMediaMutation();

    // Pre-initialize S3 connection to reduce latency on first upload
    useEffect(() => {
        s3Service.init().catch(err => console.error("[MediaLibraryView] S3 Init Fail:", err));
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return `${performance.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const addFiles = async (newFiles: File[]) => {
        const mapped = newFiles.map((f, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            file: f,
            status: 'idle' as const,
            progress: 0,
            isPublic: true
        }));
        setFiles(prev => [...prev, ...mapped]);

        // Start pre-processing in background
        mapped.forEach(mediaFile => preprocessFile(mediaFile));
    };

    const preprocessFile = async (mediaFile: MediaFile): Promise<File> => {
        const isHeic = mediaFile.file.name.toLowerCase().endsWith('.heic') ||
            mediaFile.file.name.toLowerCase().endsWith('.heif') ||
            mediaFile.file.type === 'image/heic' ||
            mediaFile.file.type === 'image/heif';

        if (isHeic) {
            if (mediaFile.file.type === 'image/webp') return mediaFile.file;

            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'processing' } : f));

            try {
                console.log(`[MediaLibraryView] Pre-processing HEIC: ${mediaFile.file.name}`);
                const convertedFile = await s3Service.convertHeicToWebp(mediaFile.file);

                setFiles(prev => prev.map(f => f.id === mediaFile.id ? {
                    ...f,
                    file: convertedFile,
                    status: f.status === 'processing' ? 'idle' : f.status
                } : f));
                return convertedFile;
            } catch (error) {
                console.error("[MediaLibraryView] HEIC conversion failed", error);
                setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'error' } : f));
            }
        }
        return mediaFile.file;
    };

    const updateProgress = (id: string, progress: number) => {
        setUploadProgress(prev => {
            const current = prev[id] || 0;
            if (progress > current) {
                return { ...prev, [id]: progress };
            }
            return prev;
        });
    };

    const handleUpload = async (mediaFile: MediaFile) => {
        setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'uploading' } : f));

        try {
            // CRITICAL: Wait for conversion if it's still pending
            const latestFile = await preprocessFile(mediaFile);

            const timestamp = Date.now();
            const entropy = Math.random().toString(36).substring(2, 10);
            const safeName = latestFile.name.replace(/\s+/g, '_');
            const key = `uploads/${timestamp}_${entropy}_${safeName}`;

            console.log(`[MediaLibraryView] Single Upload Start: ${mediaFile.id} -> ${key}`);

            const uploadResult = await s3Service.uploadFile(latestFile, key, (progress) => {
                updateProgress(mediaFile.id, progress);
            });

            const url = s3Service.getPublicUrl((uploadResult as any).key);

            if (url) {
                await createMediaMut.mutateAsync({
                    name: latestFile.name,
                    key: (uploadResult as any).key,
                    thumbnailKey: (uploadResult as any).thumbnailKey,
                    mimeType: latestFile.type,
                    size: latestFile.size,
                    isPublic: true
                });
            }

            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'completed', url: url || '' } : f));
            if (onSelect && url) onSelect(url);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log(`[MediaLibraryView] Upload ${mediaFile.id} aborted manually`);
                return;
            }
            setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'error' } : f));
            toasts.error(`Failed to upload ${mediaFile.file.name}`);
        }
    };

    const handleBulkUpload = async () => {
        const filesToUpload = files.filter(f => f.status === 'idle' || f.status === 'error');
        if (filesToUpload.length === 0) return;

        console.log(`[MediaLibraryView] Bulk Upload Started for ${filesToUpload.length} files (Parallel Persistence)`);
        setFiles(prev => prev.map(f => filesToUpload.some(u => u.id === f.id) ? { ...f, status: 'uploading' } : f));

        // Upload all simultaneously
        await Promise.all(filesToUpload.map(async (mediaFile) => {
            try {
                const latestFile = await preprocessFile(mediaFile);

                const timestamp = Date.now();
                const entropy = Math.random().toString(36).substring(2, 10);
                const safeName = latestFile.name.replace(/\s+/g, '_');
                const key = `uploads/${timestamp}_${entropy}_${safeName}`;

                // Use mediaFile.id as trackingId for cancellation
                const uploadResult = await s3Service.uploadFile(latestFile, key, (progress) => {
                    updateProgress(mediaFile.id, progress);
                }, mediaFile.id);

                const url = s3Service.getPublicUrl((uploadResult as any).key);
                if (url) {
                    // PERSIST IMMEDIATELY PER FILE
                    await createMediaMut.mutateAsync({
                        name: latestFile.name,
                        key: (uploadResult as any).key,
                        thumbnailKey: (uploadResult as any).thumbnailKey,
                        mimeType: latestFile.type,
                        size: latestFile.size,
                        isPublic: true
                    });

                    setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'completed', url: url } : f));
                }
            } catch (err: any) {
                console.error(`[MediaLibraryView] Parallel Upload Fail: ${mediaFile.id}`, err);
                setFiles(prev => prev.map(f => f.id === mediaFile.id ? { ...f, status: 'error' } : f));
                // Only show toast if not an AbortError (means user intentionally canceled)
                if (err.name !== 'AbortError') {
                    toasts.error(`Failed to upload ${mediaFile.file.name}`);
                }
            }
        }));
    };

    const handleCancel = (mediaFile: MediaFile) => {
        s3Service.cancelUpload(mediaFile.id);
        setUploadProgress(prev => {
            const next = { ...prev };
            delete next[mediaFile.id];
            return next;
        });
        setFiles(prev => prev.filter(f => f.id !== mediaFile.id));
    };

    const handleToggleVisibility = (id: string, isPublic: boolean) => {
        updateMediaMut.mutate({ id, isPublic: !isPublic });
    };

    const handleDelete = (id: string) => {
        setMediaToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = () => {
        if (mediaToDelete) {
            deleteMediaMut.mutate(mediaToDelete);
            setDeleteModalVisible(false);
            setMediaToDelete(null);
            // If deleting a single item that was also selected, clean it up
            if (selectedMediaIds.includes(mediaToDelete)) {
                setSelectedMediaIds(prev => prev.filter(id => id !== mediaToDelete));
            }
        }
    };

    const confirmBatchDelete = async () => {
        if (selectedMediaIds.length === 0) return;
        setIsBatchDeleting(true);

        // Find which items actually exist in the current library data
        const recordsToDelete = libraryMedia.filter((m: MediaRecord) => selectedMediaIds.includes(m._id));

        // Process S3 and MongoDB concurrently for speed
        const results = await Promise.allSettled(
            recordsToDelete.map(async (record: MediaRecord) => {
                try {
                    await s3Service.deleteFile(record.key);
                } catch (err) {
                    console.error(`S3 deletion failed for ${record.key}, continuing with DB deletion`, err);
                }
                await deleteMediaMut.mutateAsync(record._id);
                return record._id;
            })
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        if (successCount > 0) toasts.success(`Deleted ${successCount} assets`);

        setIsBatchDeleting(false);
        setBatchDeleteModalVisible(false);
        setSelectedMediaIds([]);
        setSelectionMode(false);
    };

    const toggleSelectionMode = () => {
        if (selectionMode) {
            // Turning off, clear selections
            setSelectedMediaIds([]);
        }
        setSelectionMode(!selectionMode);
    };

    const toggleMediaSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedMediaIds(prev =>
            prev.includes(id) ? prev.filter(mediaId => mediaId !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Media Assets</h2>
                        <p className="text-xs text-white/40 font-medium">Manage and upload your digital content.</p>
                    </div>
                </div>
                <Segmented
                    options={[
                        { label: 'Library', value: 'library', icon: <PhotoIcon className="w-4 h-4 inline mr-1" /> },
                        { label: 'Upload', value: 'upload', icon: <CloudArrowUpIcon className="w-4 h-4 inline mr-1" /> },
                    ]}
                    value={view}
                    onChange={(v) => setView(v as any)}
                    className="bg-white/5 border border-white/10 p-1 rounded-xl"
                />
            </div>

            {view === 'upload' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div
                        onDragOver={e => e.preventDefault()}
                        onDrop={onDrop}
                        className="bg-white/2 border-2 border-dashed border-white/10 rounded-3xl p-16 text-center hover:border-indigo-500/50 hover:bg-white/4 transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.onchange = (e) => addFiles(Array.from((e.target as HTMLInputElement).files || []));
                            input.click();
                        }}
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform relative z-10">
                            <CloudArrowUpIcon className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tighter relative z-10">Select files to upload</h3>
                        <p className="text-white/40 max-w-sm mx-auto font-medium relative z-10">Drag and drop images, videos, or documents. Max file size: 50MB.</p>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">Upload Queue ({files.length})</h4>
                                <div className="flex gap-2">
                                    {files.some(f => f.status === 'idle' || f.status === 'error') && (
                                        <Button
                                            type="text"
                                            size="small"
                                            loading={bulkCreateMediaMut.isPending}
                                            onClick={handleBulkUpload}
                                            className="text-indigo-400 font-bold hover:text-indigo-300 hover:bg-indigo-500/10"
                                        >
                                            Upload All
                                        </Button>
                                    )}
                                    <Button type="link" size="small" onClick={() => setFiles([])} className="text-white/30 hover:text-white font-bold">Clear All</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {files.map(f => (
                                    <div key={f.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-white/8 hover:border-white/20 shadow-lg">
                                        <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/5 relative">
                                            {f.file.type.startsWith('image/') ? (
                                                <Image
                                                    src={URL.createObjectURL(f.file)}
                                                    alt="upload preview"
                                                    fill
                                                    className="object-cover opacity-60"
                                                />
                                            ) : (
                                                <DocumentIcon className="w-8 h-8 text-indigo-400 opacity-50" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-white truncate pr-2">{f.file.name}</span>
                                                {f.status === 'completed' ? (
                                                    <Tag color="success" variant="filled" className="bg-emerald-500/10 text-emerald-400 font-black px-2 py-0 text-[10px]">READY</Tag>
                                                ) : f.status === 'processing' ? (
                                                    <Tag color="processing" variant="filled" className="bg-indigo-500/10 text-indigo-400 font-black px-2 py-0 text-[10px] animate-pulse">PROCESSING</Tag>
                                                ) : f.status === 'error' ? (
                                                    <div className="flex items-center gap-1">
                                                        <Tag color="error" variant="filled" className="bg-red-500/10 text-red-400 font-black px-2 py-0 text-[10px]">FAILED</Tag>
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<XMarkIcon className="w-4 h-4" />}
                                                            onClick={() => handleCancel(f)}
                                                            className="text-white/30 hover:text-red-400 hover:bg-red-400/10"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        {f.status === 'idle' && (
                                                            <Tooltip title="Edit Media">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                                                                    onClick={() => setEditingFile(f)}
                                                                    className="text-white/30 hover:text-indigo-400 hover:bg-indigo-400/10"
                                                                />
                                                            </Tooltip>
                                                        )}
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<XMarkIcon className="w-4 h-4" />}
                                                            onClick={() => handleCancel(f)}
                                                            className="text-white/30 hover:text-red-400 hover:bg-red-400/10"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {f.status === 'uploading' ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <Progress
                                                            percent={uploadProgress[f.id] || 0}
                                                            size="small"
                                                            strokeColor={{ '0%': '#818cf8', '100%': '#6366f1' }}
                                                            railColor="rgba(255,255,255,0.03)"
                                                            showInfo={false}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-indigo-400 w-8">{uploadProgress[f.id] || 0}%</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-white/20 tracking-wider">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                    {(f.status === 'idle' || f.status === 'error' || f.status === 'processing') && (
                                                        <button
                                                            onClick={f.status === 'processing' ? undefined : () => handleUpload(f)}
                                                            disabled={f.status === 'processing'}
                                                            className={`text-[10px] font-extrabold transition-colors uppercase tracking-widest px-2 py-1 rounded-md ${f.status === 'error' ? 'text-red-400 hover:text-red-300 bg-red-500/10' : f.status === 'processing' ? 'text-white/20 bg-white/5 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 bg-indigo-500/10'}`}
                                                        >
                                                            {f.status === 'error' ? 'RETRY' : f.status === 'processing' ? 'WAIT...' : 'UPLOAD'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <h4 className="text-sm font-black text-white/70 uppercase tracking-widest">Library</h4>
                            <span className="bg-white/5 text-white/40 text-[10px] font-black px-2 py-0.5 rounded-full">{libraryMedia.length} ITEMS</span>
                        </div>
                        <div className="flex gap-2">
                            {libraryMedia.length > 0 && (
                                <button
                                    onClick={toggleSelectionMode}
                                    className={`mr-2 h-10 px-5 rounded-xl font-bold transition-all text-sm ${selectionMode ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    {selectionMode ? 'Cancel' : 'Select'}
                                </button>
                            )}
                            <Input
                                placeholder="Search library..."
                                size="large"
                                variant="filled"
                                className="bg-white/5 border-none text-white w-64 rounded-xl h-10"
                                prefix={<MagnifyingGlassIcon className="w-4 h-4 text-white/30" />}
                            />
                        </div>
                    </div>

                    {isLibraryLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : libraryMedia.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {libraryMedia.map((m: MediaRecord) => {
                                const isSelected = selectedMediaIds.includes(m._id);
                                return (
                                    <div
                                        key={m._id}
                                        className={`group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border transition-all cursor-pointer shadow-2xl ${selectionMode && isSelected ? 'border-indigo-500 scale-95 shadow-indigo-500/20' : 'border-white/10 hover:border-indigo-500/50'}`}
                                        onClick={() => {
                                            if (selectionMode) {
                                                toggleMediaSelection(m._id);
                                            } else {
                                                onSelect?.(s3Service.getPublicUrl(m.key) || m.url || '');
                                            }
                                        }}
                                    >
                                        <Image
                                            src={m.thumbnailKey ? (s3Service.getPublicUrl(m.thumbnailKey) || '') : (s3Service.getPublicUrl(m.key) || m.url || '')}
                                            alt={m.name || 'Media Asset'}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                                        />

                                        {/* Selection Checkbox Overlay */}
                                        {selectionMode && (
                                            <div className="absolute top-4 left-4 z-20">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-black/40 border-white/60 group-hover:border-white group-hover:scale-105'}`}>
                                                    {isSelected && <svg className="w-3.5 h-3.5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            </div>
                                        )}

                                        {!selectionMode && (
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                                <Tooltip title={m.isPublic ? "Public Asset" : "Private Asset"} placement="left">
                                                    <button
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${m.isPublic ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border border-emerald-500/30' : 'bg-neutral-900/60 text-white/50 hover:text-white hover:bg-neutral-800 border border-white/20'}`}
                                                        onClick={(e) => { e.stopPropagation(); handleToggleVisibility(m._id, m.isPublic); }}
                                                        disabled={updateMediaMut.isPending && updateMediaMut.variables?.id === m._id}
                                                    >
                                                        {updateMediaMut.isPending && updateMediaMut.variables?.id === m._id ? (
                                                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            m.isPublic ? <GlobeAltIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Delete" placement="left">
                                                    <button
                                                        className="w-8 h-8 rounded-full bg-neutral-900/80 text-white/50 hover:text-red-400 hover:bg-red-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(m._id); }}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        )}

                                        <div className={`absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent transition-opacity p-5 flex flex-col justify-end pointer-events-none ${selectionMode ? (isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-40') : 'opacity-100'}`}>
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-black text-white truncate uppercase tracking-[0.2em] opacity-80">{m.name}</div>
                                                <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">{(m.size / (1024 * 1024)).toFixed(2)} MB</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white/2 rounded-3xl border border-dashed border-white/5">
                            <PhotoIcon className="w-20 h-20 mx-auto mb-6 opacity-5" />
                            <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Library is Empty</p>
                            <Button type="link" onClick={() => setView('upload')} className="text-indigo-400 mt-2 font-black">START UPLOADING</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Editing Modal */}
            {editingFile && (
                <MediaEditor
                    file={editingFile.file}
                    onSave={(newFile: File) => {
                        setFiles(prev => prev.map(f => f.id === editingFile.id ? { ...f, file: newFile } : f));
                        setEditingFile(null);
                    }}
                    onCancel={() => setEditingFile(null)}
                />
            )}
            {/* Deletion Confirmation Modal */}
            <Modal
                title={<span className="text-white font-black text-lg">Delete Media</span>}
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => { setDeleteModalVisible(false); setMediaToDelete(null); }}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{
                    loading: deleteMediaMut.isPending,
                    danger: true,
                    className: "bg-red-500 hover:bg-red-400 border-none font-bold rounded-lg px-6"
                }}
                cancelButtonProps={{
                    className: "bg-white/5 border-white/10 text-white hover:text-white hover:bg-white/10 hover:border-white/20 font-bold rounded-lg px-6"
                }}
                className="[&_.ant-modal-content]:bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden [&_.ant-modal-header]:bg-transparent [&_.ant-modal-header]:border-none [&_.ant-modal-footer]:border-none [&_.ant-modal-close]:text-white/50 hover:[&_.ant-modal-close]:text-white"
                centered
                width={400}
            >
                <div className="py-4">
                    <p className="text-white/60 font-medium leading-relaxed">Are you sure you want to permanently delete this asset? This action cannot be undone.</p>
                </div>
            </Modal>

            {/* Batch Deletion Confirmation Modal */}
            <Modal
                title={<span className="text-white font-black text-lg">Delete {selectedMediaIds.length} Assets</span>}
                open={batchDeleteModalVisible}
                onOk={confirmBatchDelete}
                onCancel={() => setBatchDeleteModalVisible(false)}
                okText="Delete All"
                cancelText="Cancel"
                okButtonProps={{
                    loading: isBatchDeleting,
                    danger: true,
                    className: "bg-red-500 hover:bg-red-400 border-none font-bold rounded-lg px-6"
                }}
                cancelButtonProps={{
                    className: "bg-white/5 border-white/10 text-white hover:text-white hover:bg-white/10 hover:border-white/20 font-bold rounded-lg px-6"
                }}
                className="[&_.ant-modal-content]:bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden [&_.ant-modal-header]:bg-transparent [&_.ant-modal-header]:border-none [&_.ant-modal-footer]:border-none [&_.ant-modal-close]:text-white/50 hover:[&_.ant-modal-close]:text-white"
                centered
                width={460}
            >
                <div className="py-4">
                    <p className="text-white/60 font-medium leading-relaxed">
                        Warning! You are about to permanently delete <strong className="text-white">{selectedMediaIds.length}</strong> media assets.
                        If any of these images are currently used in your projects, they will display as broken links. This action cannot be undone.
                    </p>
                </div>
            </Modal>

            {/* Floating Batch Action Toolbar */}
            {selectionMode && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-800/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-8">
                    <div className="px-4 py-2 bg-indigo-500/10 rounded-xl flex items-center gap-2">
                        <span className={`w-5 h-5 text-xs font-black rounded flex items-center justify-center ${selectedMediaIds.length > 0 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                            {selectedMediaIds.length}
                        </span>
                        <span className={`text-sm font-bold ${selectedMediaIds.length > 0 ? 'text-indigo-100' : 'text-white/40'}`}>Selected</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    {selectedMediaIds.length > 0 ? (
                        <button
                            onClick={() => setSelectedMediaIds([])}
                            className="text-white/50 hover:text-white font-bold text-sm px-2 transition-colors"
                        >
                            Deselect All
                        </button>
                    ) : (
                        <button
                            onClick={() => setSelectedMediaIds(libraryMedia.map((m: MediaRecord) => m._id))}
                            className="text-white/50 hover:text-white font-bold text-sm px-2 transition-colors"
                        >
                            Select All
                        </button>
                    )}
                    <button
                        onClick={() => setBatchDeleteModalVisible(true)}
                        disabled={selectedMediaIds.length === 0}
                        className={`flex items-center gap-2 font-bold px-6 h-10 rounded-xl transition-all text-sm ${selectedMediaIds.length > 0 ? 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                        Delete {selectedMediaIds.length > 0 ? `(${selectedMediaIds.length})` : ''}
                    </button>
                </div>
            )}
        </div>
    );
}
