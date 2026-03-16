"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  BoltIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { Dropdown } from "antd";

interface DashboardHeaderProps {
  onCreatePage?: () => void;
}

export const DashboardHeader = ({ onCreatePage }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'projects', label: 'Projects', href: '/home', icon: Squares2X2Icon },
    { id: 'templates', label: 'Templates', href: '/templates', icon: BoltIcon },
    { id: 'media', label: 'Media', href: '/media', icon: ListBulletIcon },
    { id: 'profile', label: 'Profile', href: '/home/profile', icon: UserIcon }
  ];

  return (
    <>
      <header className="h-16 border-b border-white/5 flex items-center px-4 lg:px-6 gap-3 lg:gap-6 sticky top-0 bg-neutral-950/80 backdrop-blur-xl z-50">
        <Link 
          href={!user ? "/" : (user as any).role === 'admin' ? "/admin" : "/home"}
          className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <BoltIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-lg font-black tracking-tighter text-white hidden sm:block">PageCraft</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          {navItems.filter(item => item.id !== 'profile').map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {onCreatePage && (
            <button 
              onClick={onCreatePage} 
              className="hidden lg:flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-white/10"
            >
              <PlusIcon className="w-4 h-4" />
              New Page
            </button>
          )}

          <div className="h-8 w-px bg-white/10 hidden lg:block" />

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-4">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "user-info",
                    label: (
                      <div className="p-3 bg-white/5 rounded-xl mb-1">
                        <div className="font-black text-sm text-white uppercase tracking-tight">{user?.name}</div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{user?.email}</div>
                      </div>
                    ),
                    disabled: true,
                  },
                  {
                    key: "profile",
                    label: "Profile Settings",
                    icon: <PencilIcon className="w-4 h-4" />,
                    onClick: () => router.push("/home/profile"),
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    label: "Log out",
                    danger: true,
                    icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />,
                    onClick: async () => { await logout(); router.push("/"); },
                  },
                ].filter(Boolean) as any,
                className: "[&_.ant-dropdown-menu]:bg-neutral-900 [&_.ant-dropdown-menu]:border [&_.ant-dropdown-menu]:border-white/10 [&_.ant-dropdown-menu]:rounded-2xl p-2",
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <button
                className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 p-px cursor-pointer hover:scale-105 transition-transform overflow-hidden relative"
              >
                <div className="w-full h-full rounded-2xl bg-neutral-900 flex items-center justify-center overflow-hidden">
                  {(user as any)?.profilePic ? (
                    <img 
                      src={(user as any).profilePic} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-black text-sm">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </button>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Bottom Tab Navigation for Mobile */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-neutral-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 pb-safe z-50 lg:hidden">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          
          // Render the "New Page" button in the middle if provided
          const renderCreateButton = idx === 2 && onCreatePage;

          return (
            <React.Fragment key={item.id}>
              {renderCreateButton && (
                <button
                  onClick={onCreatePage}
                  className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg shadow-white/10 -mt-8 border-4 border-neutral-950 active:scale-90 transition-transform shrink-0"
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
              )}
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all min-w-[64px] ${isActive ? 'text-indigo-400' : 'text-white/30'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};
