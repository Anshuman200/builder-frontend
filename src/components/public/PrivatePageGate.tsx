"use client";

import { useState, useEffect } from "react";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { request } from "@/lib/api/client";

interface PrivatePageGateProps {
  pageId: string;
  isPrivate: boolean;
  children: React.ReactNode;
}

export default function PrivatePageGate({ pageId, isPrivate, children }: PrivatePageGateProps) {
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPrivate) return;
    
    // Check session storage for existing verification
    const sessionKey = `page-auth-${pageId}`;
    if (sessionStorage.getItem(sessionKey)) {
      setVerified(true);
    }
  }, [pageId, isPrivate]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password.trim()) return;

    setIsVerifying(true);
    setError("");

    try {
      await request(`/pages/${pageId}/verify-password`, {
        method: "POST",
        body: JSON.stringify({ password: password.trim() }),
      });
      
      const sessionKey = `page-auth-${pageId}`;
      sessionStorage.setItem(sessionKey, "true");
      setVerified(true);
    } catch (err: any) {
      setError(err?.message || "Incorrect password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isPrivate || verified) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#080808]/80 backdrop-blur-3xl overflow-hidden flex flex-col items-center">
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-slide-down { animation: slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-soft { animation: pulse-soft 2s infinite ease-in-out; }
      `}</style>

      {/* Top Drawer Container */}
      <div className="w-full max-w-2xl bg-[#111] border-b border-white/5 rounded-b-[2.5rem] p-8 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.5)] animate-slide-down relative overflow-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-glow transition-transform hover:scale-110 duration-500">
            <LockClosedIcon className="w-8 h-8 text-indigo-400 animate-pulse-soft" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-3 italic">Private Access</h2>
          <p className="text-white/40 text-sm font-medium max-w-sm mb-8 leading-relaxed uppercase tracking-wider">
            This page is protected. Please enter the password provided by the author to view the content.
          </p>

          <form onSubmit={handleVerify} className="w-full max-w-md relative group">
            <div className={`relative flex items-center bg-white/5 border rounded-2xl p-1 transition-all duration-300 ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 focus-within:border-indigo-500/50 focus-within:bg-white/10 shadow-lg'}`}>
              <input
                autoFocus
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-white placeholder:text-white/20 font-bold"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>

              <button
                disabled={isVerifying || !password}
                className={`ml-1 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isVerifying || !password ? 'bg-white/5 text-white/20' : 'bg-indigo-500 text-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="absolute -bottom-7 left-0 right-0 flex justify-center animate-slide-down">
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-8 opacity-20 hover:opacity-100 transition-opacity duration-500 flex flex-col items-center">
        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">Powered by PageCraft</p>
        <div className="w-8 h-[1px] bg-white/50" />
      </div>

      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}
