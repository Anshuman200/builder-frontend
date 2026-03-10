"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi, authApi, adminApi } from "./client";

// ─── Pages Queries ──────────────────────────────────────────────────────────

export const usePages = () => {
    return useQuery({
        queryKey: ["pages"],
        queryFn: async () => {
            const { data } = await pagesApi.list();
            return Array.isArray(data) ? data : data?.pages ?? [];
        },
    });
};

export const useTemplates = () => {
    return useQuery({
        queryKey: ["templates"],
        queryFn: async () => {
            const { data } = await pagesApi.templates();
            return Array.isArray(data) ? data : data?.templates ?? [];
        },
    });
};

export const usePage = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ["pages", id],
        queryFn: async () => {
            const { data } = await pagesApi.get(id);
            return data;
        },
        enabled: !!id && enabled,
    });
};

// ─── Pages Mutations ─────────────────────────────────────────────────────────

export const useCreatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: { title: string; content?: any; meta?: any }) =>
            pagesApi.create(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
};

export const useUpdatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string } & Record<string, any>) =>
            pagesApi.update(id, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["pages", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
};

export const useDeletePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
};

export const useDuplicatePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesApi.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
};

export const usePublishPage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["pages", id] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
};

export const useUnpublishPage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["pages", id] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
};

// ─── Auth Queries ────────────────────────────────────────────────────────────

export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data } = await authApi.getProfile();
            return data;
        },
        retry: false,
    });
};

// ─── Admin Queries ────────────────────────────────────────────────────────────

export const useAdminUsers = (params: Record<string, string> = {}) => {
    return useQuery({
        queryKey: ["admin", "users", params],
        queryFn: async () => {
            const { data } = await adminApi.listUsers(params);
            return data as { users: any[]; total: number; page: number; pages: number };
        },
    });
};

export const useAdminRegions = () => {
    return useQuery({
        queryKey: ["admin", "regions"],
        queryFn: async () => {
            const { data } = await adminApi.getRegions();
            return (data as any).regions as string[];
        },
    });
};

export const useAdminUser = (id: string) => {
    return useQuery({
        queryKey: ["admin", "users", id],
        queryFn: async () => {
            const { data } = await adminApi.getUser(id);
            return data as { user: any; pages: any[] };
        },
        enabled: !!id,
    });
};

export const useActivateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.activateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};

export const useDeactivateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deactivateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};

export const useDeleteAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};

export const useAdminTemplates = (params: Record<string, string> = {}) => {
    return useQuery({
        queryKey: ["admin", "templates", params],
        queryFn: async () => {
            const { data } = await adminApi.listTemplates(params);
            return data as { templates: any[]; total: number; page: number; pages: number };
        },
    });
};
