"use client";

import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { Modal, Button, Slider, Space } from 'antd';
import { 
    ArrowsPointingOutIcon, 
    CheckIcon, 
    XMarkIcon,
    MagnifyingGlassPlusIcon,
    ArrowPathRoundedSquareIcon
} from "@heroicons/react/24/outline";

interface MediaEditorProps {
    file: File;
    onSave: (croppedFile: File) => void;
    onCancel: () => void;
}

export default function MediaEditor({ file, onSave, onCancel }: MediaEditorProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Load image
    React.useEffect(() => {
        const reader = new FileReader();
        reader.addEventListener('load', () => setImageSrc(reader.result as string));
        reader.readAsDataURL(file);
    }, [file]);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (): Promise<Blob> => {
        if (!imageSrc || !croppedAreaPixels) throw new Error('No image or crop area');
        
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('No 2d context');

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, file.type);
        });
    };

    const handleSave = async () => {
        try {
            const croppedBlob = await getCroppedImg();
            const croppedFile = new File([croppedBlob], file.name, { type: file.type });
            onSave(croppedFile);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal
            open={true}
            onCancel={onCancel}
            title={<span className="text-white">Edit Image</span>}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel} icon={<XMarkIcon className="w-4 h-4 inline mr-1" />}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSave} icon={<CheckIcon className="w-4 h-4 inline mr-1" />}>
                    Apply Changes
                </Button>
            ]}
            styles={{
                body: { background: '#111', height: '500px', position: 'relative', overflow: 'hidden' }
            }}
        >
            {imageSrc ? (
                <div className="relative h-full w-full flex flex-col">
                    <div className="flex-1 relative bg-black/50 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    
                    <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-8 mt-4 rounded-xl">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <MagnifyingGlassPlusIcon className="w-4 h-4 text-white/50" />
                                <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Zoom</span>
                            </div>
                            <Slider
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(v) => setZoom(v)}
                                tooltip={{ open: false }}
                            />
                        </div>

                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                             <Space direction="vertical" size={2}>
                                <span className="text-[10px] text-white/30 uppercase font-bold">Aspect Ratio</span>
                                <div className="flex gap-2">
                                    {[1, 4/3, 16/9].map(a => (
                                        <button 
                                            key={a}
                                            onClick={() => setAspect(a)}
                                            className={`px-3 py-1 rounded text-xs transition-colors ${aspect === a ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        >
                                            {a === 1 ? '1:1' : a === 16/9 ? '16:9' : '4:3'}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setAspect(aspect === (file.size) ? 1 : 0)} // Toggle custom if needed, but keeping it simple
                                        className="px-3 py-1 rounded text-xs bg-white/5 text-white/40"
                                        title="Freeform"
                                    >
                                        <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                                    </button>
                                </div>
                             </Space>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-white/20">
                    Loading editor...
                </div>
            )}
        </Modal>
    );
}
