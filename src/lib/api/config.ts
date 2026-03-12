import { request } from "./client";

export const configApi = {
    getMediaConfig: () => request<{ 
        region: string; 
        bucketName: string; 
        identityPoolId: string; 
    }>("/config/media"),
};
