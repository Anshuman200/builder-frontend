/**
 * Centralized type definitions for Templates and Authors.
 */

export interface Author {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
}

export interface Template {
    _id: string;
    title: string;
    category: string;
    description?: string;
    thumbnail?: string;
    thumbnails?: string[];
    author: Author;
    tags?: Array<{
        _id: string;
        name: string;
        slug: string;
        color?: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface PublicTemplateResponse {
    templates: Template[];
    total: number;
    page: number;
    pages: number;
}
