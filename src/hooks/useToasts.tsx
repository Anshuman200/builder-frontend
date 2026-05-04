"use client";

import { toast } from "sonner";
import React, { ReactNode } from "react";

// Provide a mock provider so that we don't break existing layout tree
export function ToastProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useToasts() {
    return {
        success: (msg: string, duration?: number) => {
            return toast.success(msg, {
                duration: duration || 4000,
            });
        },
        error: (msg: string, duration?: number) => {
            return toast.error(msg, {
                duration: duration || 5000,
            });
        },
        info: (msg: string, duration?: number) => {
            return toast.info(msg, {
                duration: duration || 4000,
            });
        },
        loading: (msg: string) => {
            return toast.loading(msg);
        },
        promise: (promise: Promise<any>, data: { loading: string; success: any; error: any }) => {
            return toast.promise(promise, data);
        },
        removeToast: (id: string | number) => {
            toast.dismiss(id);
        },
    };
}
