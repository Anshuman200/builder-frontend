"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { mediaApi, MediaRecord } from "@/lib/api/media";

export function useMedia(params?: { view?: 'public'; page?: number; limit?: number; search?: string; type?: string }) {
    return useQuery({
        queryKey: ["media", params],
        queryFn: async () => {
            const { data } = await mediaApi.list(params);
            return data;
        },
    });
}

export function useInfiniteMedia(params: { view?: 'public' | 'shared'; limit?: number; search?: string; type?: string }) {
    return useInfiniteQuery({
        queryKey: ["media", "infinite", params],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await mediaApi.list({ ...params, page: pageParam });
            return data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.pages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
    });
}

export const useCreateMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => mediaApi.create(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
};

export const useBulkCreateMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any[]) => mediaApi.bulkCreate(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
};

export const useUpdateMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string } & Partial<MediaRecord>) => 
            mediaApi.update(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
};

export const useDeleteMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mediaApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
};

export const useMediaUsage = (id: string | null) => {
    return useQuery({
        queryKey: ["media-usage", id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await mediaApi.getUsage(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useForkMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mediaApi.fork(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
};
