"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CommonContainerProps {
    className?: string;
    children: React.ReactNode;
}

/**
 * A standardized container for the entire application.
 * Ensures consistent width (w-full md:w-5/6) and horizontal centering.
 */
export function CommonContainer({ className, children }: CommonContainerProps) {
    return (
        <div className={cn("w-full lg:w-11/12 mx-auto px-4 sm:px-6 lg:px-10 relative z-10", className)}>
            {children}
        </div>
    );
}
