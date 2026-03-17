"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import NextImage from "next/image";
import {
    CloudArrowUpIcon,
    XMarkIcon,
    PhotoIcon,
    TrashIcon,
    GlobeAltIcon,
    LockClosedIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    RectangleStackIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import { Button, Progress, Tag, Tooltip, Input, Modal, Empty, Image as AntImage } from "antd";
import PillSegmented from "@/components/ui/PillSegmented";
import { s3Service } from "@/lib/services/s3-service";
import MediaEditor from "./MediaEditor";
import {
    useMedia,
    useInfiniteMedia,
    useUpdateMediaMutation,
    useDeleteMediaMutation
} from "@/hooks/useMedia";
import { useMediaUpload, MediaUploadFile } from "@/hooks/useMediaUpload";
import { useAuth } from "@/hooks/useAuth";
import { useToasts } from "@/hooks/useToasts";
import { MediaRecord } from "@/lib/api/media";
import { useInView } from "react-intersection-observer";

// --- Helpers -----------------------------------------------------------------

// --- Helpers -----------------------------------------------------------------

export default function MediaLibraryView({ onSelect, hideBatchActions = false }: { onSelect?: (url: string) => void, hideBatchActions?: boolean }) {
    // Default to 'public' for guests initially, otherwise 'my'
    const [tab, setTab] = useState<'my' | 'public' | 'upload'>(() => {
        if (typeof window !== "undefined") {
            const hasSession = !!document.cookie.includes("hasSession");
            return hasSession ? 'my' : 'public';
        }
        return 'my';
    });

    // --- Pagination & Search State ---
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    // We'll keep allMedia purely derived from the infinite query now
    // const [allMedia, setAllMedia] = useState<MediaRecord[]>([]);

    const [editingFile, setEditingFile] = useState<MediaUploadFile | null>(null);

    // Deletion Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Video Preview State
    const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [videoPreviewPoster, setVideoPreviewPoster] = useState<string | null>(null);

    // Multi-select State
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
    const [batchDeleteModalVisible, setBatchDeleteModalVisible] = useState(false);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);

    // Gallery Preloading State
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number | null>(null);

    const { user, isLoading: authLoading } = useAuth();
    const toasts = useToasts();

    // Make sure 'tab' updates safely if user loads later
    useEffect(() => {
        if (!authLoading && !user && tab !== 'public') {
            setTab('public');
        }
    }, [user, authLoading, tab]);

    const {
        files,
        setFiles,
        uploadProgress,
        addFiles,
        handleUpload,
        handleBulkUpload,
        handleCancel,
        clearCompleted
    } = useMediaUpload(onSelect);

    // Fetch media with Infinite Scroll
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isMediaLoading,
        refetch
    } = useInfiniteMedia({
        view: tab === 'public' ? 'public' : undefined,
        limit: 24,
        search: debouncedSearch,
        type: filterType === 'all' ? undefined : filterType
    });

    const allMedia = useMemo(() => {
        return infiniteData?.pages.flatMap(page => page.media) || [];
    }, [infiniteData]);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px'
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const updateMediaMut = useUpdateMediaMutation();
    const deleteMediaMut = useDeleteMediaMutation();

    // --- Unified Media Synchronization ---
    // (Obsolete: Removed manual sync in favor of useInfiniteMedia pages memo)
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const filteredMedia = allMedia;

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setTab('upload');
        addFiles(droppedFiles);
    }, [addFiles]);

    const handleToggleVisibility = (id: string, isPublic: boolean) => {
        updateMediaMut.mutate({ id, isPublic: !isPublic });
    };

    const handleDelete = (id: string, record: MediaRecord) => {
        if (record.owner !== user?._id) {
            toasts.error("You don't have permission to delete this asset.");
            return;
        }
        setMediaToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (mediaToDelete) {
            setIsDeleting(true);
            const record = allMedia.find(m => m._id === mediaToDelete);
            
            if (record) {
                try {
                    await s3Service.deleteFile(record.key);
                    if (record.thumbnailKey) await s3Service.deleteFile(record.thumbnailKey);
                } catch (err) {
                    // Silently fail if local deletion fails as backend handles it
                }
            }
            try {
                await deleteMediaMut.mutateAsync(mediaToDelete);
                setSelectedMediaIds(prev => prev.filter(id => id !== mediaToDelete));
            } finally {
                setIsDeleting(false);
                setDeleteModalVisible(false);
                setMediaToDelete(null);
            }
        }
    };

    const toggleMediaSelection = (id: string) => {
        setSelectedMediaIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedMediaIds(filteredMedia.map(m => m._id));
    };

    const handleDeselectAll = () => {
        setSelectedMediaIds([]);
    };

    const confirmBatchDelete = async () => {
        if (selectedMediaIds.length === 0) return;
        setIsBatchDeleting(true);

        const recordsToDelete = allMedia.filter(m => selectedMediaIds.includes(m._id));

        try {
            await Promise.allSettled(
                recordsToDelete.map(async (record) => {
                    try {
                        await s3Service.deleteFile(record.key);
                        if (record.thumbnailKey) await s3Service.deleteFile(record.thumbnailKey);
                    } catch (err) {
                        console.error(`S3 deletion failed for ${record.key}`, err);
                    }
                    return deleteMediaMut.mutateAsync(record._id);
                })
            );
            toasts.success(`Successfully deleted ${recordsToDelete.length} assets`);
        } catch (err) {
            toasts.error("Failed to delete some assets");
        } finally {
            setIsBatchDeleting(false);
            setBatchDeleteModalVisible(false);
            setSelectedMediaIds([]);
            setSelectionMode(false);
        }
    };

    const segmentedOptions = useMemo(() => {
        return [
            { label: <div className="flex items-center gap-2 px-1 md:px-2 min-w-max"><UserCircleIcon className="w-4 h-4" /> <span className="text-[10px] md:text-xs">My Media</span></div>, value: 'my' },
            { label: <div className="flex items-center gap-2 px-1 md:px-2 min-w-max"><GlobeAltIcon className="w-4 h-4" /> <span className="text-[10px] md:text-xs">Public Assets</span></div>, value: 'public' },
            { label: <div className="flex items-center gap-2 px-1 md:px-2 min-w-max"><CloudArrowUpIcon className="w-4 h-4" /> <span className="text-[10px] md:text-xs">Upload</span></div>, value: 'upload' },
        ].filter(opt => user || opt.value === 'public');
    }, [user]);

    return (
        <div className="space-y-8 min-h-[600px]">
            {/* Header / Tabs */}
            <div className="flex flex-col gap-6 pb-6 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2 md:pb-0 px-2 -mx-2">
                        <PillSegmented
                            value={tab}
                            onChange={(v) => {
                                setTab(v as any);
                                setSelectionMode(false);
                                setSelectedMediaIds([]);
                                setFilterType('all');
                            }}
                            size="large"
                            options={segmentedOptions}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Search media..."
                            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-white/30" />}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white/5 border-none text-white w-full md:w-64 rounded-xl h-11"
                            variant="filled"
                        />
                    </div>
                </div>

                {tab !== 'upload' && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto pb-2 sm:pb-0 -mx-2 px-2">
                            <button 
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                All Assets
                            </button>
                            <button 
                                onClick={() => setFilterType('image')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'image' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <PhotoIcon className="w-3.5 h-3.5" />
                                    <span>Images</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => setFilterType('video')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'video' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <RectangleStackIcon className="w-3.5 h-3.5" />
                                    <span>Videos</span>
                                </div>
                            </button>
                        </div>

                        {!hideBatchActions && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button 
                                    onClick={() => {
                                        if (selectionMode) {
                                            setSelectionMode(false);
                                            setSelectedMediaIds([]);
                                        } else {
                                            setSelectionMode(true);
                                        }
                                    }}
                                    className={`h-11! px-6 rounded-xl font-bold transition-all flex-1 sm:flex-none ${selectionMode ? 'bg-indigo-500 text-white border-none shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    {selectionMode ? 'Exit Selection' : 'Batch Actions'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            {tab === 'upload' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div
                        onDrop={onDrop}
                        onDragOver={e => e.preventDefault()}
                        className="group relative h-72 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/2 hover:bg-white/4 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-2xl"
                        onClick={() => document.getElementById('media-upload-input')?.click()}
                    >
                        <input
                            type="file"
                            id="media-upload-input"
                            multiple
                            className="hidden"
                            onChange={e => e.target.files && addFiles(Array.from(e.target.files))}
                        />
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner">
                            <CloudArrowUpIcon className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Drop Assets Here</h3>
                        <p className="text-white/30 text-xs mt-2 font-bold tracking-tight">JPG, PNG, WEBP, HEIC OR VIDEO (MAX 100MB)</p>
                    </div>

                    {files.length > 0 && (
                        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-sm font-black text-white/70 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full inline-block">Upload Queue ({files.length})</h4>
                                <div className="flex gap-2">
                                    <Button onClick={clearCompleted} className="bg-white/5 border-white/10 text-white hover:text-white hover:bg-white/10 font-bold rounded-xl h-10">Clear Completed</Button>
                                    <Button onClick={handleBulkUpload} type="primary" className="bg-indigo-500 hover:bg-indigo-400 border-none font-bold rounded-xl px-8 h-10 shadow-lg shadow-indigo-500/20">Upload All</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {files.map(f => (
                                    <div key={f.id} className="relative bg-white/3 border border-white/10 rounded-3xl p-2 flex flex-col sm:flex-row gap-4 sm:gap-5 group hover:bg-white/5 transition-all hover:shadow-2xl">
                                        <div className="w-full sm:w-20 h-40 sm:h-20 rounded-2xl overflow-hidden bg-black/40 shrink-0 flex items-center justify-center border border-white/10">
                                            {(f.previewUrl || f.placeholder) ? (
                                                <AntImage
                                                    src={f.previewUrl || f.placeholder}
                                                    alt="Preview"
                                                    width="100%"
                                                    height="100%"
                                                    className="object-cover"
                                                    placeholder={f.placeholder ? (
                                                        <div className="w-full h-full bg-white/5 animate-pulse" />
                                                    ) : undefined}
                                                    preview={{
                                                        cover: <EyeIcon className="w-5 h-5 text-white" />
                                                    }}
                                                />
                                            ) : (
                                                <PhotoIcon className="w-8 h-8 text-white/10" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-black text-white truncate uppercase tracking-widest">{f.file.name}</div>
                                                    <div className="text-[8px] font-extrabold text-white/20 mt-0.5">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {f.file.type.startsWith('image/') && f.status === 'idle' && (
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                                                            onClick={() => setEditingFile(f)}
                                                            className="text-white/20 hover:text-indigo-400 hover:bg-indigo-400/10"
                                                        />
                                                    )}
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<XMarkIcon className="w-4 h-4" />}
                                                        onClick={() => handleCancel(f)}
                                                        className="text-white/20 hover:text-red-400 hover:bg-red-400/10"
                                                    />
                                                </div>
                                            </div>
                                            {f.status === 'uploading' ? (
                                                <div className="flex items-center gap-3">
                                                    <Progress
                                                        percent={uploadProgress[f.id] || 0}
                                                        size="small"
                                                        showInfo={false}
                                                        strokeColor="#6366f1"
                                                        railColor="rgba(255,255,255,0.05)"
                                                        className="flex-1"
                                                    />
                                                    <span className="text-[10px] font-black text-indigo-400">{uploadProgress[f.id] || 0}%</span>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${f.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                                                        {f.status}
                                                    </span>
                                                    {(f.status === 'idle' || f.status === 'error') && (
                                                        <button
                                                            onClick={() => handleUpload(f)}
                                                            className="text-[9px] font-black text-indigo-400 hover:underline tracking-tighter"
                                                        >
                                                            UPLOAD NOW
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
            )
                : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between px-2">
                            <div className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                                {tab === 'my' ? 'My Library' : 'Global Public Assets'} — {filteredMedia.length} Items
                            </div>
                        </div>

                        {allMedia.length === 0 && (isMediaLoading || search !== debouncedSearch) ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-square rounded-3xl sm:rounded-4xl bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : allMedia.length > 0 ? (
                            <>
                                <AntImage.PreviewGroup
                                    preview={{
                                        onChange: (current) => setCurrentPreviewIndex(current),
                                        onOpenChange: (visible) => {
                                            if (!visible) setCurrentPreviewIndex(null);
                                        },
                                    }}
                                >
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-6">
                                        {allMedia.map((m, index) => {
                                            const isSelected = selectedMediaIds.includes(m._id);
                                            const isOwner = m.owner === user?._id;
                                            const assetUrl = s3Service.getPublicUrl(m.key) || m.url || '';
                                            const isVideo = m.mimeType?.startsWith('video/');
                                            const thumbnail = m.thumbnailKey 
                                                ? (s3Service.getPublicUrl(m.thumbnailKey) || '') 
                                                : (isVideo && m.placeholder ? m.placeholder : assetUrl);

                                            return (
                                                <div
                                                    key={m._id}
                                                    className={`group relative aspect-square rounded-4xl overflow-hidden bg-white/5 border transition-all duration-300 shadow-2xl flex items-center justify-center ${selectionMode && isSelected ? 'border-indigo-500 scale-95 ring-4 ring-indigo-500/20' : 'border-white/5 hover:border-white/20 hover:scale-[1.02]'}`}
                                                    onClick={(e) => {
                                                        if (selectionMode) {
                                                            e.stopPropagation();
                                                            toggleMediaSelection(m._id);
                                                        } else if (onSelect) {
                                                            onSelect?.(assetUrl);
                                                        }
                                                    }}
                                                >
                                                    <div className="relative w-full h-full">
                                                        <NextImage
                                                            src={thumbnail}
                                                            alt={m.name}
                                                            fill
                                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                                            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${m.mimeType?.startsWith('video/') ? '' : ''}`}
                                                            priority={index < 8}
                                                            placeholder={!m.mimeType?.startsWith('video/') && m.placeholder ? "blur" : undefined}
                                                            blurDataURL={m.placeholder}
                                                        />
                                                        
                                                        {/* Hidden AntImage for Preview Trigger (or custom click handler for video) */}
                                                        {!(selectionMode || onSelect) && (
                                                            <div 
                                                                className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                                onClick={() => {
                                                                    // If we know it's a video OR if it has a thumbnail (which implies video), intercept preview
                                                                    const isVideoInfo = m.mimeType?.startsWith('video/') || !!m.thumbnailKey;
                                                                    if (isVideoInfo) {
                                                                        setVideoPreviewUrl(assetUrl);
                                                                        // thumbnail already prioritizes thumbKey > placeholder > assetUrl
                                                                        setVideoPreviewPoster(thumbnail); 
                                                                        setVideoPreviewVisible(true);
                                                                    }
                                                                }}
                                                            >
                                                                {/* Only render AntImage for non-videos, so its internal Mask trigger works */}
                                                                {!(m.mimeType?.startsWith('video/') || !!m.thumbnailKey) ? (
                                                                    <AntImage
                                                                        src={assetUrl}
                                                                    preview={{
                                                                        cover: (
                                                                            <div className="flex flex-col items-center gap-2 font-black text-[10px] tracking-widest text-white">
                                                                                <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center border border-white/10">
                                                                                    <EyeIcon className="w-5 h-5" />
                                                                                </div>
                                                                                PREVIEW
                                                                            </div>
                                                                        ),
                                                                    }}
                                                                    className="hidden"
                                                                    rootClassName="absolute inset-0 w-full h-full! [&_.ant-image-mask]:rounded-4xl"
                                                                />
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center w-full h-full bg-black/40">
                                                                        <div className="flex flex-col items-center gap-2 font-black text-[10px] tracking-widest text-white">
                                                                            <div className="w-10 h-10 rounded-full bg-indigo-500/80 flex items-center justify-center border border-white/20">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                                                                                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                            PLAY
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={`absolute inset-0 z-20 bg-linear-to-t from-black/80 via-transparent to-black/40 transition-opacity p-4 flex flex-col justify-between pointer-events-none ${selectionMode ? 'opacity-100 bg-black/20' : 'opacity-0 group-hover:opacity-100'}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            {selectionMode ? (
                                                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-lg pointer-events-auto ${isSelected ? 'bg-indigo-500 border-indigo-500 scale-110' : 'bg-black/20 border-white/40'}`}>
                                                                    {isSelected && (
                                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            ) : isOwner ? (
                                                                <div className="flex gap-1 pointer-events-auto">
                                                                    <Tooltip title={m.isPublic ? "Public" : "Private"}>
                                                                        <button
                                                                            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${m.isPublic ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40' : 'bg-black/40 text-white/50 hover:bg-black/60'}`}
                                                                            onClick={(e) => { e.stopPropagation(); handleToggleVisibility(m._id, m.isPublic); }}
                                                                        >
                                                                            {m.isPublic ? <GlobeAltIcon className="w-3.5 h-3.5" /> : <LockClosedIcon className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <button
                                                                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-400/40 backdrop-blur-md transition-all"
                                                                            onClick={(e) => { e.stopPropagation(); handleDelete(m._id, m); }}
                                                                        >
                                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </Tooltip>
                                                                </div>
                                                            ) : (
                                                                <Tag className="bg-white/10 border-none text-[8px] font-black text-white/40 uppercase tracking-widest backdrop-blur-md px-2 py-0.5">READ ONLY</Tag>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[10px] font-black text-white truncate tracking-widest uppercase mb-0.5">{m.name}</div>
                                                            <div className="text-[8px] font-bold text-white/40 uppercase">{(m.size / (1024 * 1024)).toFixed(2)} MB</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Infinite Scroll Sentinel */}
                                    <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center">
                                        {(hasNextPage || isFetchingNextPage) && (
                                            <div className="flex flex-col items-center gap-4 py-8">
                                                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] animate-pulse">
                                                    Loading more magic...
                                                </span>
                                            </div>
                                        )}
                                        {!hasNextPage && allMedia.length > 0 && (
                                            <div className="py-12 flex flex-col items-center gap-3">
                                                <div className="h-px w-24 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                                    End of Library
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </AntImage.PreviewGroup>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 bg-white/2 rounded-[3rem] border border-dashed border-white/5">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<span className="text-white/20 font-black tracking-widest uppercase text-[10px]">No assets found</span>}
                                />
                                {tab === 'my' && (
                                    <Button ghost onClick={() => setTab('upload')} className="mt-8 border-white/10 text-white/50 hover:text-white hover:border-white font-black uppercase text-[10px] tracking-widest h-10 px-8 rounded-xl">Upload First Asset</Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

            {/* Modals */}
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

            {/* Permanently Delete */}
            <Modal
                title={<span className="text-white font-black uppercase tracking-widest text-sm">Delete Asset</span>}
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => { setDeleteModalVisible(false); setMediaToDelete(null); setIsDeleting(false); }}
                okText="Permanently Delete"
                cancelText="Cancel"
                centered
                okButtonProps={{ danger: true, className: "bg-red-500 font-bold h-10 rounded-xl", loading: isDeleting }}
                cancelButtonProps={{ className: "bg-white/5 border-none text-white h-10 rounded-xl", disabled: isDeleting }}
                closable={!isDeleting}
                mask={{ closable: !isDeleting }}
                className="[&_.ant-modal-content]:bg-neutral-900 border border-white/10 rounded-4xl overflow-hidden [&_.ant-modal-header]:bg-transparent [&_.ant-modal-header]:border-none [&_.ant-modal-close]:text-white/50"
            >
                <p className="text-white/50 py-4 font-medium tracking-tight">Are you sure you want to delete this asset? This will remove it from all pages using it.</p>
            </Modal>

            {/* Video Player Modal */}
            <Modal
                title={null}
                footer={null}
                open={videoPreviewVisible}
                onCancel={() => {
                    setVideoPreviewVisible(false);
                    setVideoPreviewUrl(null);
                    setVideoPreviewPoster(null);
                }}
                centered
                destroyOnHidden
                width={800}
                className="[&_.ant-modal-content]:bg-transparent [&_.ant-modal-content]:shadow-none [&_.ant-modal-content]:p-0 [&_.ant-modal-close]:text-white/70 hover:[&_.ant-modal-close]:text-white"
            >
                {videoPreviewUrl && (
                    <div className="rounded-3xl overflow-hidden bg-black/50 backdrop-blur-3xl border border-white/10 shadow-2xl relative">
                        <video 
                            src={videoPreviewUrl} 
                            poster={videoPreviewPoster || undefined}
                            controls 
                            autoPlay 
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </div>
                )}
            </Modal>

            {/* Delete */}
            <Modal
                title={<span className="text-white font-black uppercase tracking-widest text-sm">Delete Multiple Assets</span>}
                open={batchDeleteModalVisible}
                onOk={confirmBatchDelete}
                onCancel={() => setBatchDeleteModalVisible(false)}
                okText={`Delete ${selectedMediaIds.length} Assets`}
                cancelText="Cancel"
                centered
                okButtonProps={{
                    danger: true,
                    className: "bg-red-500 font-bold h-10 rounded-xl",
                    loading: isBatchDeleting
                }}
                cancelButtonProps={{ className: "bg-white/5 border-none text-white h-10 rounded-xl" }}
                className="[&_.ant-modal-content]:bg-neutral-900 border border-white/10 rounded-4xl overflow-hidden [&_.ant-modal-header]:bg-transparent [&_.ant-modal-header]:border-none [&_.ant-modal-close]:text-white/50"
            >
                <p className="text-white/50 py-4 font-medium tracking-tight">Are you sure you want to delete {selectedMediaIds.length} selected assets? This action cannot be undone.</p>
            </Modal>

            {/* Floating Bottom Action Bar */}
            {selectionMode && (
                <div className="fixed bottom-20 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-4xl p-3 pl-8 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Selected</span>
                            <span className="text-sm font-black text-white">{selectedMediaIds.length} Assets</span>
                        </div>

                        <div className="h-8 w-px bg-white/5" />

                        <div className="flex items-center gap-2">
                            <Button
                                type="text"
                                onClick={handleSelectAll}
                                className="text-white/60 hover:text-white font-bold h-10 px-4 rounded-xl hover:bg-white/5"
                            >
                                Select All
                            </Button>
                            <Button
                                type="text"
                                onClick={handleDeselectAll}
                                className="text-white/60 hover:text-white font-bold h-10 px-4 rounded-xl hover:bg-white/5"
                            >
                                Deselect All
                            </Button>
                        </div>

                        <div className="h-8 w-px bg-white/5" />

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => {
                                    setSelectionMode(false);
                                    setSelectedMediaIds([]);
                                }}
                                className="bg-white/5 border-none text-white/50 font-bold h-12! px-6! rounded-full! hover:text-white hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setBatchDeleteModalVisible(true)}
                                disabled={selectedMediaIds.length === 0}
                                icon={<TrashIcon className="w-4 h-4" />}
                                className="bg-red-500 hover:bg-red-400 border-none font-black h-12! px-6! rounded-full! shadow-xl shadow-red-500/20 flex items-center gap-2"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
