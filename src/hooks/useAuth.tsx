"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { authApi } from "@/lib/api/client";
import { setTokens, clearTokens } from "@/lib/utils";

interface User {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    plan: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.login({ email, password });
            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.register({ name, email, password });
            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        clearTokens();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
