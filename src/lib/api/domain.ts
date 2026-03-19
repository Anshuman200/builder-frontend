import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3019/api';

const handleResponse = (res: any) => {
    if (res.status >= 400) {
        throw new Error(res.data?.error || res.data?.message || 'Request failed');
    }
    return res.data;
};

export const domainApi = {
    list: (userId?: string) => axios.get(`${BASE_URL}/domains/list`, { params: { userId } }).then(handleResponse),
    create: (domain: string, targetUrl: string, userId?: string, pageId?: string) => 
        axios.post(`${BASE_URL}/domains/create`, { domain, targetUrl, userId, pageId }).then(handleResponse),
    verify: (id: string) => axios.post(`${BASE_URL}/domains/${id}/verify`).then(handleResponse),
    delete: (id: string, userId?: string) => axios.delete(`${BASE_URL}/domains/${id}`, { params: { userId } }).then(handleResponse),
};

export const proxyApi = {
    create: (pageId: string, originUrl: string) => 
        axios.post(`${BASE_URL}/landing-proxy/create`, { pageId, originUrl }).then(handleResponse),
    status: (pageId: string) => axios.get(`${BASE_URL}/landing-proxy/status/${pageId}`).then(handleResponse),
};
