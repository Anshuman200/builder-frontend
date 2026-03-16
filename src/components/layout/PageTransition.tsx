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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 }
                }}
                className={cn("w-full relative", className)}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
