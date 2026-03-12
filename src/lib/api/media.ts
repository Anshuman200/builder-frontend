import { request } from "./client";

export interface MediaRecord {
    _id: string;
    name: string;
    url: string;
    key: string;
    thumbnailKey?: string;
    mimeType: string;
    size: number;
    isPublic: boolean;
    createdAt: string;
}

export const mediaApi = {
    list: () => request<{ media: MediaRecord[] }>("/media"),
    
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
