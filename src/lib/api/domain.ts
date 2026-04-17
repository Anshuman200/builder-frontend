import { request } from "./client";

export const domainApi = {
    list: (userId?: string) => {
        const params = userId ? `?userId=${userId}` : "";
        return request(`/domains/list${params}`);
    },
    create: (domain: string, targetUrl: string, userId?: string, pageId?: string, visibility?: string, password?: string) => 
        request("/domains/create", {
            method: "POST",
            body: JSON.stringify({ domain, targetUrl, userId, pageId, visibility, password }),
        }),
    verify: (id: string) => 
        request(`/domains/${id}/verify`, {
            method: "POST",
        }),
    updateVisibility: (id: string, visibility: string, password?: string) =>
        request(`/domains/${id}/visibility`, {
            method: "PATCH",
            body: JSON.stringify({ visibility, password }),
        }),
    delete: (id: string, userId?: string) => {
        const params = userId ? `?userId=${userId}` : "";
        return request(`/domains/${id}${params}`, {
            method: "DELETE",
        });
    },
};

export const proxyApi = {
    create: (pageId: string, originUrl: string, visibility?: string, password?: string) => 
        request("/landing-proxy/create", {
            method: "POST",
            body: JSON.stringify({ pageId, originUrl, visibility, password }),
        }),
    status: (pageId: string) => 
        request(`/landing-proxy/status/${pageId}`),
};
