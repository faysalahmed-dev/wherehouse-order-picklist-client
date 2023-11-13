import { api } from './base';

export function getAllSubCategoriesOptions(category: string) {
    return api(`/sub-categories/${category}/options`, { method: 'get' });
}

export function getAllSubCategories(category: string, page = 1) {
    return api(`/sub-categories/${category}?page=${page}`, { method: 'get' });
}

export function deleteSubCategory(id: string) {
    return api(`/sub-categories/${id}`, { method: 'delete' });
}

export function saveSubCategory(data: any, id?: string) {
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
