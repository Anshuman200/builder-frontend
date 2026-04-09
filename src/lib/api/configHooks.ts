"use client";

import { useQuery } from "@tanstack/react-query";
import { configApi } from "./config";

export const useMediaConfig = () => {
    return useQuery({
        queryKey: ["config", "media"],
        queryFn: async () => {
            const { data } = await configApi.getMediaConfig();
            return data;
        },
        staleTime: Infinity, // Media config (AWS/Cloudflare creds) rarely changes
    });
};
