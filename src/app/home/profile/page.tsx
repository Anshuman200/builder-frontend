"use client";

import { ProfileSettingsForm } from "@/components/auth/ProfileSettingsForm";
import { UserIcon } from "@heroicons/react/24/outline";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { CommonContainer } from "@/components/layout/CommonContainer";

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <DashboardHeader />

      <CommonContainer className="py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <UserIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Manage your personal information and security</p>
              </div>
            </div>
          </div>

          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-xl">
            <ProfileSettingsForm backUrl="/home" />
          </div>
        </div>
      </CommonContainer>
    </div>
  );
}
