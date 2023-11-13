import { api } from './base';

export function getAllCategoriesOptions() {
    return api(`/categories/options`, { method: 'get' });
}

export function getAllCategories(page = 1) {
    return api(`/categories?page=${page}`, { method: 'get' });
}

export function deleteCategory(id: string) {
    return api(`/categories/${id}`, { method: 'delete' });
}

export function saveCategory(data: any, id?: string) {
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
