"use client";

import type { Toast, ToastType } from "@/@Types";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useToasts } from "@/hooks/useToasts";

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
    error: <ExclamationCircleIcon className="w-5 h-5 text-rose-500" />,
    loading: (
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    ),
    info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
};

export function ToastContainer() {
    const { toasts, removeToast } = useToasts();

    return (
        <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="pointer-events-auto"
                    >
                        <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    return (
        <div className="flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="shrink-0">{icons[toast.type]}</div>

            <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {toast.message}
            </div>

            <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>

            {/* Progress bar for auto-dismissing toasts */}
            {toast.duration !== Infinity && (
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-[2px] bg-indigo-500/30"
                />
            )}
        </div>
    );
}
