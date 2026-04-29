import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  src?: string;
}

export const Logo = ({ className = "w-8 h-8", src = "/logo.png" }: LogoProps) => {
  return (
    <div className="flex items-center gap-2 select-none group">
      <div className={`relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${className}`}>
        {/* Glow effect behind the logo */}
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[10px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

        {/* User's logo image */}
        <Image
          src={src}
          alt="Solario Forge Logo"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="relative z-10 object-contain drop-shadow-xl rounded-xl"
          priority
          quality={100}
        />
      </div>
    </div>
  );
};
