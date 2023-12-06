import type { APIResponse, PaginationAPIResponse } from '~/types/response';
import { api } from './base';

export interface SubCategoryOpt {
    id: string;
    name: string;
    value: string;
}

export interface SubCategory extends SubCategoryOpt {
    description: string;
    userId: string;
    user: {
        id: string;
        name: string;
        type: string;
    };
    categoryId: string;
    category: {
        id: string;
        name: string;
        value: string;
    };
}

export function getAllSubCategoriesOptions(category: string) {
    return api<PaginationAPIResponse<SubCategoryOpt[]>>(
        `/sub-categories/${category}/options`,
        { method: 'get' }
    );
}

export function getAllSubCategories(category: string, page = 1) {
    return api<PaginationAPIResponse<SubCategory[]>>(
        `/sub-categories/${category}?page=${page}`,
        { method: 'get' }
    );
}

export function deleteSubCategory(id: string) {
    return api<APIResponse<null>>(`/sub-categories/${id}`, {
        method: 'delete',
    });
}

export function saveSubCategory(
    data: { name: string; description: string },
    id?: string
) {
    if (id) {
        return api(`/sub-categories/edit/${id}`, {
            method: 'patch',
            body: JSON.stringify(data),
        });
    } else {
        return api('/sub-categories/add-subcategory', {
            method: 'post',
            body: JSON.stringify(data),
        });
    }
}
