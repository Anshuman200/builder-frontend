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

async function request<T = any>(
    path: string,
    opts: RequestInit = {}
): Promise<{ data: T }> {
    let token = getCookie("accessToken");

    const getHeaders = (t: string | null) => ({
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(opts.headers ?? {}),
    });

    let res = await fetch(`${API}${path}`, {
        ...opts,
        headers: getHeaders(token),
    });

    if (res.status === 401 && !path.startsWith("/auth/")) {
        // Create the promise to wait for the refreshed token before we might trigger the refresh itself
        const tokenPromise = new Promise<string>((resolve) => {
            subscribeTokenRefresh(t => resolve(t));
        });

        // Attempt refresh
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newToken = data.accessToken || getCookie("accessToken");
                    onRefreshed(newToken || "");
                } else {
                    onRefreshed("");
                    // Let the React auth context handle the UI update based on the ensuing 401 error.
                }
            } catch (err) {
                onRefreshed("");
            } finally {
                isRefreshing = false;
            }
        }

        // Wait for the refreshed token
        const newToken = await tokenPromise;

        if (newToken) {
            res = await fetch(`${API}${path}`, {
                ...opts,
                headers: getHeaders(newToken),
            });
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Request failed: ${res.status}`);
    }

    const data = await res.json();
    return { data };
}

export const pagesApi = {
    list: () => request("/pages"),

    create: (body: { title: string, content?: any, meta?: any }) =>
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
};

export const authApi = {
    login: (body: Record<string, string>) =>
        // Call our Next.js proxy so tokens are set as cookies
        fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? "Login failed");
            return { data };
        }),

    register: (body: Record<string, string>) =>
        request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

    verifyOtp: (body: Record<string, string>) =>
        fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? "Verification failed");
            return { data };
        }),

    logout: () =>
        fetch("/api/auth/logout", { method: "POST" }),

    getProfile: () => request("/users/profile"),

    forgotPassword: (body: Record<string, string>) =>
        request("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),

    resetPassword: (body: Record<string, string>) =>
        request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
};
