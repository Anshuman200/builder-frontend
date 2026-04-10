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
    return useMutation({
        mutationFn: (body: { domain: string, targetUrl: string, userId: string, pageId?: string }) => 
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
    return useMutation({
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
    return useMutation({
        mutationFn: ({ id, userId }: { id: string, userId?: string }) => domainApi.delete(id, userId),
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
    const { message } = App.useApp();
    return useMutation({
        mutationFn: ({ pageId, originUrl }: { pageId: string, originUrl: string }) => 
            proxyApi.create(pageId, originUrl),
        onError: (err: any) => {
            message.error(err.message || "Failed to deploy worker proxy");
        }
    });
};
