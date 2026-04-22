"use client";

import { usePathname } from "next/navigation";

/**
 * PremiumEffects Component
 * 
 * Conditionally renders premium visual effects like noise overlay and glow blobs.
 * These are disabled on /preview and /editor routes to avoid interfering with 
 * user-created content.
 */
export function PremiumEffects() {
  const pathname = usePathname();
  
  // Disable on preview and editor pages to keep user content clean
  const isExcluded = pathname?.startsWith("/preview") || pathname?.startsWith("/editor");

  if (isExcluded) return null;

  return (
    <>
      {/* Global Premium Noise Texture Overlay */}
      <div className="noise fixed inset-0 opacity-[0.03] pointer-events-none z-[9999]" />
      
      {/* Premium Ambient Glow Blobs */}
      <div 
        className="fixed top-[-10%] right-[-5%] w-[80vw] h-[80vw] bg-radial-gradient from-indigo-500/15 via-transparent to-transparent blur-[140px] rounded-full pointer-events-none z-0 transition-opacity duration-1000 animate-pulse-glow" 
      />
      <div 
        className="fixed bottom-[-5%] left-[-10%] w-[70vw] h-[70vw] bg-radial-gradient from-purple-500/10 via-transparent to-transparent blur-[140px] rounded-full pointer-events-none z-0 transition-opacity duration-1000" 
        style={{ animationDelay: '2s' }} 
      />
      <div 
        className="fixed top-[40%] left-[-20%] w-[50vw] h-[50vw] bg-radial-gradient from-blue-500/5 via-transparent to-transparent blur-[140px] rounded-full pointer-events-none z-0 transition-opacity duration-1000" 
      />
    </>
  );
}
