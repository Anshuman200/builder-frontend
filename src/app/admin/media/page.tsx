"use client";

import { useState } from "react";
import MediaManager from "@/components/media/MediaManager";
import { PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "antd";

export default function MediaPage() {
    const [managerOpen, setManagerOpen] = useState(false);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Media Library</h1>
                    <p className="text-white/40 font-medium">Manage your digital assets, uploads, and site media.</p>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusIcon className="w-5 h-5 inline mr-1" />}
                    onClick={() => setManagerOpen(true)}
                    className="h-12 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-400 border-none shadow-lg shadow-indigo-500/20 font-bold"
                >
                    Add New Media
                </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PhotoIcon className="w-12 h-12 text-white/20" />
                </div>
                <h2 className="text-xl font-bold text-white mb-4">Centralized Asset Management</h2>
                <p className="text-white/40 max-w-md mx-auto mb-8">
                    Your media library stores all images and documents in a secure S3 bucket.
                    Search, filter, and manage visibility across your entire application.
                </p>
                <Button
                    ghost
                    onClick={() => setManagerOpen(true)}
                    className="!h-12 !border-white !text-white hover:text-indigo-400 hover:border-indigo-400 px-8 rounded-lg"
                >
                    Open Library Manager
                </Button>
            </div>

            <MediaManager
                open={managerOpen}
                onClose={() => setManagerOpen(false)}
            />
        </div>
    );
}
