"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
    children: React.ReactNode;
    pathname: string;
    className?: string;
}

export const PageTransition = ({ children, pathname, className }: PageTransitionProps) => {
    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{
                    duration: 0.35,
                    ease: "easeInOut"
                }}
                className={cn("absolute inset-0 h-full w-full", className)}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
