"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
        // The landing page just needs the top 10
        queryFn: async () => {
            const { data } = await pagesApi.templates({ limit: 10 });
            return Array.isArray(data) ? data : data?.templates ?? [];
        },
    });
};

export const useInfinitePublicTemplates = (params?: Record<string, string | number>) => {
    return useInfiniteQuery({
        queryKey: ["templates", "infinite", params],
        // Cast pageParam to 'any' initially if type definitions are strict, or use the signature correctly
        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const { data } = await pagesApi.templates({ ...params, page: pageParam });
            return data;
        },
        getNextPageParam: (lastPage: any) => {
            if (lastPage.page < lastPage.pages) return lastPage.page + 1;
            return undefined;
        },
        initialPageParam: 1,
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

// ─── Site Pages Queries ──────────────────────────────────────────────────────

export const useSitePage = (slug: string) => {
    return useQuery({
        queryKey: ["site-page", slug],
        queryFn: async () => {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3019/api';
            const res = await fetch(`${API}/site-pages/${slug}`);
            if (!res.ok) {
                throw new Error("Page not found");
            }
            const data = await res.json();
            return data.page;
        },
        enabled: !!slug,
        retry: false,
    });
};

export const useSitePages = () => {
    return useQuery({
        queryKey: ["site-pages"],
        queryFn: async () => {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3019/api';
            const res = await fetch(`${API}/site-pages`);
            if (!res.ok) {
                throw new Error("Pages not found");
            }
            const data = await res.json();
            return data.pages;
        },
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
            queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
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
            queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
            // Force refetch to be absolutely sure
            queryClient.refetchQueries({ queryKey: ["admin", "templates"] });
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
            queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
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
            queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
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
            queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
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
            queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
        },
    });
};

export const useStopLivePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesApi.stopLive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["pages", id] });
        },
    });
};

export const useGoLivePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagesApi.goLive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["pages", id] });
        },
    });
};

export const useUpdateUserLimit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, publishLimit }: { id: string; publishLimit: number }) =>
            adminApi.updateUserLimit(id, publishLimit),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "users", id] });
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

// ─── Forms Mutations ──────────────────────────────────────────────────────────

export const useSubmitForm = () => {
    return useMutation({
        mutationFn: (body: any) => {
            // we use the backend directly so no proxy fetch here!
            return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3019/api'}/forms/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }).then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to submit form");
                return data;
            });
        },
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

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: { name?: string; profilePic?: string }) => authApi.updateProfile(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.changePassword(body),
    });
};
