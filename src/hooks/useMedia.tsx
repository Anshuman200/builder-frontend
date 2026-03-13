"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi, MediaRecord } from "@/lib/api/media";

export function useMedia(params?: { view?: 'public' }) {
    return useQuery({
        queryKey: ["media", params],
        queryFn: async () => {
            const { data } = await mediaApi.list(params);
            return data.media;
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
