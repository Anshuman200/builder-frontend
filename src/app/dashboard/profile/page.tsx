"use client";

import { ProfileSettingsForm } from "@/components/auth/ProfileSettingsForm";
import { UserIcon } from "@heroicons/react/24/outline";

export default function UserProfilePage() {
  return (
    <div className="min-h-full bg-neutral-950 p-6 lg:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <UserIcon className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
              <p className="text-neutral-400 font-medium">Manage your personal information and security</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
          <ProfileSettingsForm backUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}
