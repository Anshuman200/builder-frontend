"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./client";

// ******************************************** Site Pages ********************************************
export const useAdminSitePages = () => {
    return useQuery({
        queryKey: ["admin", "site-pages"],
        queryFn: async () => {
            const { data } = await adminApi.listSitePages();
            return (data as any).pages as any[];
        },
    });
};

export const useCreateSitePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => adminApi.createSitePage(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "site-pages"] }),
    });
};

export const useUpdateSitePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string } & any) => adminApi.updateSitePage(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "site-pages"] }),
    });
};

export const useDeleteSitePage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deleteSitePage(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "site-pages"] }),
    });
};

// ******************************************** Page Tags ********************************************
export const useAdminPageTags = () => {
    return useQuery({
        queryKey: ["admin", "page-tags"],
        queryFn: async () => {
            const { data } = await adminApi.listPageTags();
            return (data as any).tags || [];
        },
    });
};

export const useCreatePageTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => adminApi.createPageTag(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "page-tags"] }),
    });
};

export const useUpdatePageTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string } & any) => adminApi.updatePageTag(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "page-tags"] }),
    });
};

export const useDeletePageTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deletePageTag(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "page-tags"] }),
    });
};

// ******************************************** Inquiries ********************************************
export const useAdminInquiries = () => {
    return useQuery({
        queryKey: ["admin", "inquiries"],
        queryFn: async () => {
            const { data } = await adminApi.listInquiries();
            return (data as any).inquiries as any[];
        },
    });
};

export const useReplyInquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, replyMessage }: { id: string, replyMessage: string }) => adminApi.replyInquiry(id, replyMessage),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }),
    });
};

export const useDeleteInquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deleteInquiry(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }),
    });
};
