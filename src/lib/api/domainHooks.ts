"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { domainApi, proxyApi } from "./domain";
import { App } from "antd";

export const useDomains = (userId?: string) => {
    return useQuery({
        queryKey: ["domains", userId],
        queryFn: async () => {
            const { data } = await domainApi.list(userId);
            return data as any[];
        },
        enabled: !!userId,
        staleTime: 30000, // 30 seconds
    });
};

export const useCreateDomain = () => {
    const queryClient = useQueryClient();
    const { message } = App.useApp();
    return useMutation<any, any, { domain: string, targetUrl: string, userId: string, pageId?: string }>({
        mutationFn: (body) =>
            domainApi.create(body.domain, body.targetUrl, body.userId, body.pageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["domains"] });
            message.success("Domain connected successfully!");
        },
        onError: (err: any) => {
            message.error(err.message || "Failed to connect domain");
        }
    });
};

export const useVerifyDomain = () => {
    const queryClient = useQueryClient();
    const { message } = App.useApp();
    return useMutation<any, any, string>({
        mutationFn: (id: string) => domainApi.verify(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["domains"] });
            message.success("Status updated!");
        },
        onError: (err: any) => {
            message.error(err.message || "Verification failed");
        }
    });
};

export const useDeleteDomain = () => {
    const queryClient = useQueryClient();
    const { message } = App.useApp();
    return useMutation<any, any, { id: string, userId?: string }>({
        mutationFn: ({ id, userId }) => domainApi.delete(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["domains"] });
            message.success("Domain removed");
        },
        onError: (err: any) => {
            message.error(err.message || "Failed to delete domain");
        }
    });
};

export const useCreateProxy = () => {
    const queryClient = useQueryClient();
    const { message } = App.useApp();
    return useMutation<any, any, { pageId: string, originUrl: string }>({
        mutationFn: ({ pageId, originUrl }) =>
            proxyApi.create(pageId, originUrl),
        onSuccess: (_, variables) => {
            const { pageId } = variables;
            queryClient.invalidateQueries({ queryKey: ["domains"] });
            queryClient.invalidateQueries({ queryKey: ["proxy-status", pageId] });
            message.success("Worker deployed successfully!");
        },
        onError: (err: any) => {
            message.error(err.message || "Failed to deploy worker proxy");
        }
    });
};

export const useProxyStatus = (pageId?: string) => {
    return useQuery({
        queryKey: ["proxy-status", pageId],
        queryFn: async () => {
            if (!pageId) return null;
            const res: any = await proxyApi.status(pageId);
            return res.data || res;
        },
        enabled: !!pageId,
    });
};
