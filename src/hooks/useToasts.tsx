"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ToastType, Toast } from "@/@Types";

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: ToastType, duration?: number) => string;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => string;
    error: (message: string, duration?: number) => string;
    loading: (message: string) => string;
    info: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message: string, type: ToastType, duration: number = 4000) => {
            const id = Math.random().toString(36).substring(2, 9);
            setToasts((prev) => [...prev, { id, message, type, duration }]);

            if (type !== "loading" && duration !== Infinity) {
                setTimeout(() => removeToast(id), duration);
            }

            return id;
        },
        [removeToast]
    );

    const success = useCallback((msg: string, dur?: number) => addToast(msg, "success", dur), [addToast]);
    const error = useCallback((msg: string, dur?: number) => addToast(msg, "error", dur), [addToast]);
    const loading = useCallback((msg: string) => addToast(msg, "loading", Infinity), [addToast]);
    const info = useCallback((msg: string, dur?: number) => addToast(msg, "info", dur), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, loading, info }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToasts() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToasts must be used within a ToastProvider");
    }
    return context;
}
