"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { pagesApi, authApi, adminApi, request } from "./client";
import { getCookie } from "@/lib/utils";

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

export const usePageTags = () => {
    return useQuery({
        queryKey: ["page-tags"],
        queryFn: async () => {
            const { data } = await pagesApi.getTags();
            return (data as any).tags || [];
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
            const { data } = await request<{ page: any }>(`/site-pages/${slug}`);
            return data.page || data;
        },
        enabled: !!slug,
        retry: false,
    });
};

export const useSitePages = () => {
    return useQuery({
        queryKey: ["site-pages"],
        queryFn: async () => {
            const { data } = await request<{ pages: any[] }>(`/site-pages`);
            return data.pages || (Array.isArray(data) ? data : []);
        },
    });
};

// ─── Pages Mutations ─────────────────────────────────────────────────────────

function touchesTemplateListing(body: Record<string, any>) {
    return ["isTemplate", "isPublic", "category", "status", "title", "slug", "thumbnail", "thumbnails"].some((key) => key in body);
}

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
        onSuccess: (res, variables) => {
            const updatedPage = (res as any)?.data?.page || (res as any)?.data;
            if (updatedPage) {
                queryClient.setQueryData(["pages", variables.id], updatedPage);
            }
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            if (touchesTemplateListing(variables)) {
                queryClient.invalidateQueries({ queryKey: ["templates"] });
                queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
            }
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
            // Handle both { user: ... } and direct user object
            return data?.user || (data?._id ? data : null);
        },
        enabled: !!getCookie("hasSession"),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 min
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.login(body),
        onSuccess: (res) => {
            queryClient.setQueryData(["profile"], res.data.user);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["pages"] });
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.register(body),
    });
};

export const useResendOtp = () => {
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.resendOtp(body),
    });
};

export const useVerifyOtp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.verifyOtp(body),
        onSuccess: (res) => {
            queryClient.setQueryData(["profile"], res.data.user);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => authApi.logout(),
        onSettled: () => {
            queryClient.setQueryData(["profile"], null);
            queryClient.clear(); // Clear all cache on logout
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.forgotPassword(body),
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (body: Record<string, string>) => authApi.resetPassword(body),
    });
};

// ─── Forms Mutations ──────────────────────────────────────────────────────────

export const useSubmitForm = () => {
    return useMutation({
        mutationFn: (body: any) => 
            request("/forms/submit", {
                method: "POST",
                body: JSON.stringify(body),
            }),
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
