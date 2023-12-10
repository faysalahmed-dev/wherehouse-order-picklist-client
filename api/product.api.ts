import type { PaginationAPIResponse, APIResponse } from '~/types/response';
import type { Order } from './order.api';
import { api } from './base';

export interface Product {
    id: string;
    name: string;
    userId: string;
    user: {
        id: string;
        name: string;
        type: string;
    };
    subCategoryId: string;
    subCategory: {
        id: string;
        name: string;
        value: string;
    };
    orders: Pick<Order, 'id' | 'amount' | 'unit'>[];
}

export function getAllProducts(subCategoryId: string) {
    return api<PaginationAPIResponse<Product[]>>(`/products/${subCategoryId}`, {
        method: 'get',
    });
}

export function deleteProduct(id: string) {
    return api(`/products/${id}`, { method: 'delete' });
}

export function addProduct(subCategorySlug: string, data: { name: string }) {
    return api<APIResponse<Product>>(`/products/${subCategorySlug}`, {
        method: 'post',
        body: JSON.stringify(data),
    });
}

export function updateProduct(productId: string, data: { name: string }) {
    return api(`/products/${productId}`, {
        method: 'patch',
        body: JSON.stringify(data),
    });
}
