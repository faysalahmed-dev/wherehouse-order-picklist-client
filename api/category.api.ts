import { PaginationAPIResponse } from '~/types/response';
import { api } from './base';

export interface CategoryOption {
    id: string;
    name: string;
    value: string;
}
export interface Category extends CategoryOption {
    userId: string;
    user: {
        id: string;
        name: string;
        type: 'ADMIN' | 'USER';
    };
}

export function getAllCategoriesOptions() {
    return api<PaginationAPIResponse<CategoryOption[]>>(`/categories/options`, {
        method: 'get',
    });
}

export function getAllCategories(page = 1) {
    return api<PaginationAPIResponse<Category[]>>(`/categories?page=${page}`, {
        method: 'get',
    });
}

export function deleteCategory(id: string) {
    return api(`/categories/${id}`, { method: 'delete' });
}

export function saveCategory(data: { name: string }, id?: string) {
    if (id) {
        return api(`/categories/edit/${id}`, {
            method: 'patch',
            body: JSON.stringify(data),
        });
    } else {
        return api('/categories/add-category', {
            method: 'post',
            body: JSON.stringify(data),
        });
    }
}
