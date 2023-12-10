import type { APIResponse, PaginationAPIResponse } from '~/types/response';
import { api } from './base';

type Product = {
    id: string;
    name: string;
    subCategoryId: string;
    subCategory: {
        id: string;
        name: string;
        value: string;
        description: string;
        categoryId: string;
        category: {
            id: string;
            name: string;
            value: string;
        };
    };
};

export interface GroupOrderByUser {
    total: number;
    user_id: string;
    last_submission: Date;
    name: string;
    email: string;
}

export interface Order {
    id: string;
    amount: number;
    unit: string;
    status: 'PENDING' | 'DONE';
    created_at: Date;
    updated_at: Date;
    userId: string;
    productId: string;
    product: Product;
}

export function addOrder(
    productId: string,
    data: { amount: number; unit_type: string }
) {
    return api<APIResponse<Order>>(`/orders/${productId}/add-order`, {
        method: 'post',
        body: JSON.stringify(data),
    });
}
// admin only
export function getAllOrdersByUser(page = 1, userId?: string) {
    const query = { page: page || 1 } as {
        userId: string;
        page: number;
    };
    console.log(userId);
    if (userId) query.userId = userId;
    return api<PaginationAPIResponse<GroupOrderByUser[]>>('/orders', {
        method: 'get',
        query,
    });
}

export function getMyOrder(page = 1) {
    return api<PaginationAPIResponse<Order[]>>('/orders/my-orders', {
        method: 'get',
        query: { page },
    });
}

export function getSingleUserOrders(userId: string, page = 1) {
    return api<PaginationAPIResponse<Order[]>>(
        `/orders/view-orders/${userId}`,
        {
            method: 'get',
            query: { page },
        }
    );
}

export function myOrders(page = 1) {
    return api<PaginationAPIResponse<Order[]>>(`/orders/my-orders`, {
        method: 'get',
        query: { page },
    });
}

export function gerUserOptions() {
    return api<APIResponse<Order[]>>('/orders/user-options', {
        method: 'get',
    });
}

export function getOrdersByStatus(
    page?: number,
    options?: { category: string | null; sub_category: string | null }
) {
    const query = { page: page || 1, status: 'PICKED' } as {
        category?: string;
        sub_category?: string;
        page: number;
    };
    if (options?.category) query.category = options.category;
    if (options?.sub_category) query.sub_category = options.sub_category;
    return api('/orders/pick-list', {
        method: 'get',
        query,
    });
}

export function deleteOrder(id: string) {
    return api('/orders/' + id, { method: 'delete' });
}

export function updateOrder(
    id: string,
    data: { amount: number; unit_type: string }
) {
    return api('/orders/edit/' + id, {
        method: 'patch',
        body: JSON.stringify(data),
    });
}

export function updateStatus(id: string, status: 'DONE' | 'PENDING') {
    return api(`/orders/update-status/${id}`, {
        method: 'patch',
        body: JSON.stringify({ status }),
    });
}
