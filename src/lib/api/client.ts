import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1";

export const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
});

// ─── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
type FailedRequest = { resolve: (token: string) => void; reject: (err: unknown) => void };
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
                processQueue(null, data.accessToken);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/"; // redirect to landing
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data),
    logout: () => api.post("/auth/logout"),
    me: () => api.get("/auth/me"),
    updateMe: (data: { name?: string; avatarUrl?: string }) =>
        api.patch("/auth/me", data),
};

// ─── Pages API ─────────────────────────────────────────────────────────────
export const pagesApi = {
    list: (params?: Record<string, string>) => api.get("/pages", { params }),
    create: (data: { title: string; type?: string; templateId?: string }) =>
        api.post("/pages", data),
    get: (id: string) => api.get(`/pages/${id}`),
    update: (id: string, data: Record<string, unknown>) =>
        api.patch(`/pages/${id}`, data),
    delete: (id: string) => api.delete(`/pages/${id}`),
    publish: (id: string) => api.post(`/pages/${id}/publish`),
    unpublish: (id: string) => api.post(`/pages/${id}/unpublish`),
    duplicate: (id: string) => api.post(`/pages/${id}/duplicate`),
    getPublic: (slug: string) => api.get(`/pages/public/${slug}`),
};

// ─── Assets API ─────────────────────────────────────────────────────────────
export const assetsApi = {
    presign: (data: { filename: string; contentType: string; size: number }) =>
        api.post("/assets/presign", data),
    confirm: (data: {
        s3Key: string; name: string; mimeType: string; size: number;
        width?: number; height?: number;
    }) => api.post("/assets/confirm", data),
    list: (params?: { type?: string; page?: number }) =>
        api.get("/assets", { params }),
    delete: (id: string) => api.delete(`/assets/${id}`),
};

// ─── Templates API ──────────────────────────────────────────────────────────
export const templatesApi = {
    list: (params?: { category?: string; search?: string; isPro?: boolean; page?: number }) =>
        api.get("/templates", { params }),
    categories: () => api.get("/templates/categories"),
    get: (id: string) => api.get(`/templates/${id}`),
};

// ─── Domains API ────────────────────────────────────────────────────────────
export const domainsApi = {
    list: () => api.get("/domains"),
    add: (data: { hostname: string; pageId?: string }) =>
        api.post("/domains", data),
    verify: (id: string) => api.post(`/domains/${id}/verify`),
    delete: (id: string) => api.delete(`/domains/${id}`),
};

// ─── Analytics API ──────────────────────────────────────────────────────────
export const analyticsApi = {
    track: (data: { pageId: string; event: "view" | "click" | "form_submit"; referrer?: string }) =>
        api.post("/analytics/event", data),
    get: (pageId: string) => api.get(`/analytics/${pageId}`),
};
