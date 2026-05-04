import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { mediaApi, MediaRecord } from "./media";
import { toast } from "sonner";

export const useMedia = (params?: Parameters<typeof mediaApi.list>[0]) => {
    return useQuery({
        queryKey: ["media", params],
        queryFn: async () => {
            const { data } = await mediaApi.list(params);
            return data;
        },
        staleTime: 60000, // 1 minute
    });
};

export const useInfiniteMedia = (params?: Parameters<typeof mediaApi.list>[0]) => {
    return useInfiniteQuery({
        queryKey: ["media", "infinite", params],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await mediaApi.list({ ...params, page: pageParam as number });
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.pages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
};

export const useCreateMedia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: Omit<MediaRecord, "_id" | "createdAt" | "url">) => mediaApi.create(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
        },
    });
};

export const useBulkCreateMedia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: Omit<MediaRecord, "_id" | "createdAt" | "url">[]) => mediaApi.bulkCreate(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
        },
    });
};

export const useUpdateMedia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string, body: Partial<MediaRecord> }) => mediaApi.update(id, body),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            queryClient.invalidateQueries({ queryKey: ["media", id] });
        },
    });
};

export const useDeleteMedia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mediaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            toast.success("File deleted");
        },
        onError: (err: any) => {
            toast.error(err.message || "Delete failed");
        }
    });
};

export const useMediaUsage = (id: string) => {
    return useQuery({
        queryKey: ["media", id, "usage"],
        queryFn: async () => {
            const { data } = await mediaApi.getUsage(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useForkMedia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mediaApi.fork(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            toast.success("File added to your library");
        },
    });
};
