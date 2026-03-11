"use client";

import { App } from "antd";
import React, { ReactNode } from "react";

// Provide a mock provider so that we don't break existing layout tree
export function ToastProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useToasts() {
    const { message } = App.useApp();

    return {
        success: (msg: string, duration?: number) => {
            message.success(msg, duration ? duration / 1000 : 4);
            return msg; // Return string to match previous API
        },
        error: (msg: string, duration?: number) => {
            message.error(msg, duration ? duration / 1000 : 4);
            return msg;
        },
        info: (msg: string, duration?: number) => {
            message.info(msg, duration ? duration / 1000 : 4);
            return msg;
        },
        loading: (msg: string) => {
            message.loading(msg, 0); // 0 means don't auto dismiss
            return msg;
        },
        removeToast: (id: string) => {
            message.destroy(); // Antd doesn't easily dismiss by ID in static method, so we destroy all or ignore
        },
    };
}
