import { request } from "./client";

export interface MediaRecord {
    _id: string;
    name: string;
    url: string;
    key: string;
    thumbnailKey?: string;
    placeholder?: string;
    mimeType: string;
    size: number;
    isPublic: boolean;
    owner: string;
    createdAt: string;
}

export const mediaApi = {
    list: (params?: { view?: 'public'; page?: number; limit?: number; search?: string; type?: string }) => {
        const sp = new URLSearchParams();
        if (params?.view) sp.append('view', params.view);
        if (params?.page) sp.append('page', params.page.toString());
        if (params?.limit) sp.append('limit', params.limit.toString());
        if (params?.search) sp.append('search', params.search);
        if (params?.type) sp.append('type', params.type);
        
        const qs = sp.toString() ? `?${sp.toString()}` : "";
        return request<{ 
            media: MediaRecord[];
            pagination: { total: number; page: number; limit: number; pages: number }
        }>(`/media${qs}`);
    },
    
    create: (body: Omit<MediaRecord, "_id" | "createdAt" | "url">) => 
        request<{ media: MediaRecord }>("/media", {
            method: "POST",
            body: JSON.stringify(body),
        }),
        
    bulkCreate: (body: Omit<MediaRecord, "_id" | "createdAt" | "url">[]) => 
        request<{ media: MediaRecord[] }>("/media/bulk", {
            method: "POST",
            body: JSON.stringify(body),
        }),
    
    update: (id: string, body: Partial<MediaRecord>) =>
        request<{ media: MediaRecord }>(`/media/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
        }),
    
    delete: (id: string) =>
        request(`/media/${id}`, {
            method: "DELETE",
        }),
        
    getUsage: (id: string) => request<{ isUsed: boolean, pages: any[] }>(`/media/${id}/usage`),
};
