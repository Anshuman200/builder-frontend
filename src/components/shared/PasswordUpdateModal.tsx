"use client";

import { useState } from "react";
import { Modal, Input, Button } from "antd";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useToasts } from "@/hooks/useToasts";

interface PasswordUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading?: boolean;
  title?: string;
}

export default function PasswordUpdateModal({ open, onClose, onConfirm, loading, title = "Update Page Password" }: PasswordUpdateModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { success, error } = useToasts();

  const handleConfirm = async () => {
    if (!password.trim()) {
      error("Password cannot be empty");
      return;
    }
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (e) {
      // Error handled by parent or toast
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      closeIcon={<span className="text-white/20 hover:text-white transition-colors">×</span>}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
          <KeyIcon className="w-8 h-8 text-indigo-400" />
        </div>

        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight italic">{title}</h2>
        <p className="text-white/40 text-xs font-medium mb-8 leading-relaxed">
          Set a secure password to control access to your private project.
        </p>

        <div className="w-full relative group mb-6">
          <div className="relative flex items-center bg-white/5 border border-white/5 rounded-2xl p-1 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all duration-300">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password..."
              variant="borderless"
              className="flex-1 bg-transparent text-white placeholder:text-white/20 font-bold py-2 px-3"
              onPressEnter={handleConfirm}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-white/30 hover:text-white transition-colors"
            >
              {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="w-full flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 text-white/40 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
            className={`flex-1 py-3 px-4 bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 ${loading || !password.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
