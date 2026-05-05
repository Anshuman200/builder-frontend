"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { clearTokens, getCookie } from "@/lib/utils";
import { useProfile, useLogin, useRegister, useLogout, useVerifyEmail, useForgotPassword, useResetPassword } from "@/lib/api/queries";
import { hasSessionSecret, setSessionSecret } from "@/lib/utils/crypto";

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
    verifyEmail: (payload: string, password?: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (payload: string, newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (u: User | null) => void;
    fetchProfile: () => void;
    error: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [keyStatus, setKeyStatus] = useState<"locked" | "unlocked">("locked");

    // Unified Data Fetching via TanStack Query
    const { data: user, isLoading, refetch: fetchProfile } = useProfile();
    
    // Auth Mutations
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const verifyEmailMutation = useVerifyEmail();
    const logoutMutation = useLogout();
    const forgotPasswordMutation = useForgotPassword();
    const resetPasswordMutation = useResetPassword();

    // Sync Key Status (Legacy - for E2EE or similar logic)
    useEffect(() => {
        setKeyStatus(hasSessionSecret() ? "unlocked" : "locked");
    }, [user]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await loginMutation.mutateAsync({ email, password });
        setSessionSecret(password);
        setKeyStatus("unlocked");
        return { redirectTo: res.data.redirectTo };
    }, [loginMutation]);

    const register = useCallback(async (name: string, email: string, password: string) => {
        await registerMutation.mutateAsync({ name, email, password });
    }, [registerMutation]);

    const verifyEmail = useCallback(async (payload: string, password?: string) => {
        await verifyEmailMutation.mutateAsync({ payload });
        if (password) {
            setSessionSecret(password);
            setKeyStatus("unlocked");
        }
    }, [verifyEmailMutation]);

    const forgotPassword = useCallback(async (email: string) => {
        await forgotPasswordMutation.mutateAsync({ email });
    }, [forgotPasswordMutation]);

    const resetPassword = useCallback(async (payload: string, newPassword: string) => {
        await resetPasswordMutation.mutateAsync({ payload, newPassword });
    }, [resetPasswordMutation]);

    const logout = useCallback(async () => {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            clearTokens();
            setSessionSecret(null);
            setKeyStatus("locked");
        }
    }, [logoutMutation]);

    // Dummy setter for compatibility if needed, though useQuery is the source of truth now
    const setUser = () => {};

    const globalAuthError = (loginMutation.error || registerMutation.error || verifyEmailMutation.error || forgotPasswordMutation.error || resetPasswordMutation.error) as any;

    return (
        <AuthContext.Provider value={{ 
            user: (user as User | null) ?? null, 
            isLoading: isLoading || 
                       loginMutation.isPending || 
                       registerMutation.isPending || 
                       verifyEmailMutation.isPending || 
                       forgotPasswordMutation.isPending || 
                       resetPasswordMutation.isPending ||
                       logoutMutation.isPending, 
            keyStatus, 
            login, 
            register, 
            verifyEmail, 
            forgotPassword, 
            resetPassword, 
            logout, 
            setUser, 
            fetchProfile,
            error: globalAuthError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
