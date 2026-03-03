"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { clearTokens, getCookie } from "@/lib/utils";
import { authApi } from "@/lib/api/client";

interface User {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    plan: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (u: User | null) => void;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // true until profile is checked

    const fetchProfile = useCallback(async () => {
        if (!getCookie("hasSession")) {
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await authApi.getProfile();
            if (data) setUser(data as User);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Restore auth state on every page load from cookie-based session
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.login({ email, password });
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await authApi.register({ name, email, password });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(async (email: string, otp: string) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.verifyOtp({ email, otp });
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            clearTokens();
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, forgotPassword, resetPassword, logout, setUser, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
