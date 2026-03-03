"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi, authApi } from "./client";

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
