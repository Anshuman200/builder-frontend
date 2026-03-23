"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { clearTokens, getCookie } from "@/lib/utils";
import { authApi } from "@/lib/api/client";

interface User {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    profilePic?: string;
    plan: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    keyStatus: "locked" | "unlocked";
    login: (email: string, password: string) => Promise<{ redirectTo?: string }>;
    register: (name: string, email: string, password: string) => Promise<void>;
    verifyOtp: (email: string, otp: string, password?: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (u: User | null) => void;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [keyStatus, setKeyStatus] = useState<"locked" | "unlocked">("locked");

    const fetchProfile = useCallback(async () => {
        if (!getCookie("hasSession")) {
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await authApi.getProfile();
            // Handle both { user: ... } and direct user object for robustness
            const userData = data?.user || (data?._id ? data : null);
            if (userData) {
                setUser(userData as User);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check key status on mount and when user changes
    useEffect(() => {
        const hasKey = !!sessionStorage.getItem("pagecraft_session_key");
        setKeyStatus(hasKey ? "unlocked" : "locked");
    }, [user]);

    // Restore auth state on every page load
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
 
    // // Heartbeat: Regularly ensure user is valid and refresh token if needed
    // // No Need while using Tanstack Query
    // useEffect(() => {
    //     if (!user || isLoading) return;
 
    //     const interval = setInterval(() => {
    //         fetchProfile();
    //     }, 20000); // Poll every 20s (since expiry is 30s)
 
    //     return () => clearInterval(interval);
    // }, [user, isLoading, fetchProfile]);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.login({ email, password });
            // WhatsApp-Grade: Capture password in session storage for E2EE
            sessionStorage.setItem("pagecraft_session_key", password);
            setUser(data.user);
            setKeyStatus("unlocked");
            return { redirectTo: data.redirectTo };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await authApi.register({ name, email, password });
            // We don't log in immediately on register usually, but if we did:
            // sessionStorage.setItem("pagecraft_session_key", password);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(async (email: string, otp: string, password?: string) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.verifyOtp({ email, otp });
            if (password) {
                sessionStorage.setItem("pagecraft_session_key", password);
                setKeyStatus("unlocked");
            }
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const forgotPassword = useCallback(async (email: string) => {
        setIsLoading(true);
        try {
            await authApi.forgotPassword({ email });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetPassword = useCallback(async (email: string, resetToken: string, newPassword: string) => {
        setIsLoading(true);
        try {
            await authApi.resetPassword({ email, resetToken, newPassword });
            // Re-login might happen here or after
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            clearTokens();
            sessionStorage.removeItem("pagecraft_session_key");
            setUser(null);
            setKeyStatus("locked");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, keyStatus, login, register, verifyOtp, forgotPassword, resetPassword, logout, setUser, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
