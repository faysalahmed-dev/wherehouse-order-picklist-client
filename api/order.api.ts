import { api } from './base';

export function getOrderOptions(subCategory: string) {
    return api('/orders/options/' + subCategory, { method: 'get' });
}

export function addOrder(data: any) {
    return api('/orders/add-order', {
        method: 'post',
        body: JSON.stringify(data),
    });
}

export function getAllOrders(
    page?: number,
    options?: { category: string | null; sub_category: string | null }
) {
    const query = { page: page || 1 } as {
        category?: string;
        sub_category?: string;
        page: number;
    };
    if (options?.category) query.category = options.category;
    if (options?.sub_category) query.sub_category = options.sub_category;
    return api('/orders', {
        method: 'get',
        query,
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

export function updateOrder(id: string, data: any) {
    return api('/orders/edit/' + id, {
        method: 'patch',
        body: JSON.stringify(data),
    });
}

export function updateStatus(id: string, status: number) {
    return api(`/orders/update-status/${id}`, {
        method: 'patch',
        body: JSON.stringify({ status }),
    });
}
