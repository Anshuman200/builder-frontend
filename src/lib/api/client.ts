import { getCookie } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3019/api";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
}

export async function request<T = any>(
    path: string,
    opts: RequestInit = {}
): Promise<{ data: T }> {
    const headers: any = {
        ...(opts.headers ?? {}),
    };
 
    if (opts.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
 
    let res = await fetch(`${API}${path}`, {
        ...opts,
        credentials: "include", // CRITICAL: Send and receive cookies
        headers,
    });

    if (res.status === 401 && !path.startsWith("/auth/") && getCookie("hasSession")) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                // Call backend refresh directly
                const refreshRes = await fetch(`${API}/auth/refresh`, { 
                    method: "POST",
                    credentials: "include" 
                });
                if (!refreshRes.ok) {
                    throw new Error("Session expired");
                }
                onRefreshed("done");
            } catch (err) {
                onRefreshed("");
                if (typeof window !== 'undefined') {
                    // Trigger global login modal on terminal refresh failure
                    window.dispatchEvent(new CustomEvent('show-auth-modal', { 
                        detail: { reason: 'session_expired' } 
                    }));
                }
                throw err;
            } finally {
                isRefreshing = false;
            }
        } else {
            // Wait for the refreshed token
            await new Promise<void>((resolve) => subscribeTokenRefresh(() => resolve()));
        }
 
        // CRITICAL: Clear any stale Authorization header
        const retryHeaders = { ...headers };
        delete retryHeaders["Authorization"];
        delete retryHeaders["authorization"];

        // GIVE THE BROWSER A BREATHER: Commit cookie store.
        console.log(`[AUTH] Token refreshed for ${path}, retrying after delay...`);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Retry with same options and sanitized headers
        res = await fetch(`${API}${path}`, {
            ...opts,
            credentials: "include",
            headers: retryHeaders,
        });
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Request failed: ${res.status}`);
    }

    const data = await res.json();
    
    // Robust data unwrapping:
    // 1. If 'success' is present, try to return 'data' field.
    // 2. If 'success' is true but 'data' is missing, treat the rest of the object as data.
    // 3. Otherwise return raw data.
    let result = data;
    if (data && typeof data === 'object' && 'success' in data) {
        if ('data' in data) {
            result = data.data;
        } else {
            const { success, message, ...rest } = data;
            // If it's an empty success (just success: true), return the whole thing
            result = Object.keys(rest).length > 0 ? rest : data;
        }
    }

    return { data: result };
}

export const pagesApi = {
    list: () => request("/pages"),
    templates: (params?: Record<string, string | number>) => {
        const urlParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    urlParams.append(key, String(value));
                }
            });
        }
        const qs = urlParams.toString();
        return request(`/pages/templates${qs ? `?${qs}` : ""}`);
    },

    create: (body: { title: string, content?: any, meta?: any, tags?: string[] }) =>
        request("/pages", { method: "POST", body: JSON.stringify(body) }),

    get: (id: string) => request(`/pages/${id}`),

    update: (id: string, body: Record<string, unknown>) =>
        request(`/pages/${id}`, { method: "PUT", body: JSON.stringify(body) }),

    delete: (id: string) =>
        request(`/pages/${id}`, { method: "DELETE" }),

    duplicate: (id: string) =>
        request(`/pages/${id}/duplicate`, { method: "POST", body: "{}" }),

    publish: (id: string) =>
        request(`/pages/${id}/publish`, { method: "POST", body: "{}" }),

    unpublish: (id: string) =>
        request(`/pages/${id}/unpublish`, { method: "POST", body: "{}" }),

    getTags: () => request(`/page-tags`),

    goLive: (id: string) =>
        request(`/pages/${id}/go-live`, { method: "POST", body: "{}" }),

    stopLive: (id: string) =>
        request(`/pages/${id}/stop-live`, { method: "POST", body: "{}" }),
    
    verifyPassword: (id: string, password: string) =>
        request(`/pages/${id}/verify-password`, { method: "POST", body: JSON.stringify({ password }) }),
};

export const authApi = {
    login: (body: Record<string, string>) =>
        // Call backend directly with credentials
        fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ...body,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }),
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                const error: any = new Error(data.message || "Sign in failed");
                error.status = res.status;
                error.data = data;
                throw error;
            }
            return { data: (data && typeof data === 'object' && 'success' in data) ? data.data : data };
        }),
 
    register: (body: Record<string, string>) =>
        request("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                ...body,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
        }),

    resendVerification: (body: Record<string, string>) =>
        request("/auth/resend-verification", {
            method: "POST",
            body: JSON.stringify(body)
        }),
 
    verifyEmail: (body: Record<string, string>) =>
        fetch(`${API}/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ...body,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }),
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                const error = new Error(data.message ?? "Verification failed");
                (error as any).status = res.status;
                (error as any).data = data;
                throw error;
            }
            return { data: (data && typeof data === 'object' && 'success' in data) ? data.data : data };
        }),
 
    logout: () =>
        fetch(`${API}/auth/logout`, { 
            method: "POST",
            credentials: "include"
        }),

    getProfile: () => request("/users/profile"),

    forgotPassword: (body: Record<string, string>) =>
        request("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),

    resetPassword: (body: Record<string, string>) =>
        request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

    updateProfile: (body: { name?: string; profilePic?: string }) =>
        request("/users/profile", { method: "PATCH", body: JSON.stringify(body) }),

    changePassword: (body: Record<string, string>) =>
        request("/users/change-password", { method: "POST", body: JSON.stringify(body) }),
};

export const adminApi = {
    // Users
    listUsers: (params: Record<string, string> = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/admin/users${qs ? `?${qs}` : ""}`);
    },

    getRegions: () => request("/admin/users/regions"),

    getUser: (id: string) => request(`/admin/users/${id}`),

    activateUser: (id: string) =>
        request(`/admin/users/${id}/activate`, { method: "PATCH", body: "{}" }),

    deactivateUser: (id: string) =>
        request(`/admin/users/${id}/deactivate`, { method: "PATCH", body: "{}" }),

    deleteUser: (id: string) =>
        request(`/admin/users/${id}`, { method: "DELETE" }),

    updateUserLimit: (id: string, publishLimit: number) =>
        request(`/admin/users/${id}/limit`, { method: "PATCH", body: JSON.stringify({ publishLimit }) }),

    // Templates
    listTemplates: (params: Record<string, string> = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/admin/templates${qs ? `?${qs}` : ""}`);
    },

    // Site Pages
    listSitePages: () => request("/admin/site-pages"),
    createSitePage: (body: any) => request("/admin/site-pages", { method: "POST", body: JSON.stringify(body) }),
    updateSitePage: (id: string, body: any) => request(`/admin/site-pages/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deleteSitePage: (id: string) => request(`/admin/site-pages/${id}`, { method: "DELETE" }),

    // Page Tag Management
    listPageTags: () => request("/admin/page-tags"),
    createPageTag: (body: any) => request("/admin/page-tags", { method: "POST", body: JSON.stringify(body) }),
    updatePageTag: (id: string, body: any) => request(`/admin/page-tags/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deletePageTag: (id: string) => request(`/admin/page-tags/${id}`, { method: "DELETE" }),

    // Inquiries
    listInquiries: () => request("/admin/inquiries"),
    replyInquiry: (id: string, replyMessage: string) => request(`/admin/inquiries/${id}/reply`, { method: "PATCH", body: JSON.stringify({ replyMessage }) }),
    deleteInquiry: (id: string) => request(`/admin/inquiries/${id}`, { method: "DELETE" }),
};

export const formsApi = {
    submit: (body: any) => request("/forms/submit", { method: "POST", body: JSON.stringify(body) }),
};

export const proxyApi = {
    get: (url: string) => request(`/proxy?url=${encodeURIComponent(url)}`),
};
