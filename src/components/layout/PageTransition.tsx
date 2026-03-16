// "use client";

// import React from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { cn } from "@/lib/utils";

// interface PageTransitionProps {
//     children: React.ReactNode;
//     pathname: string;
//     className?: string;
// }

// export const PageTransition = ({ children, pathname, className }: PageTransitionProps) => {
//     return (
//         <AnimatePresence mode="popLayout">
//             <motion.div
//                 key={pathname}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 transition={{
//                     duration: 0.3,
//                     ease: [0.4, 0, 0.2, 1],
//                     opacity: { duration: 0.2 }
//                 }}
//                 className={cn("w-full relative will-change-[transform,opacity]", className)}
//             >
//                 {children}
//             </motion.div>
//         </AnimatePresence>
//     );
// };

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
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className={cn("w-full relative", className)}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};