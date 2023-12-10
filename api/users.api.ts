import type { APIResponse } from '~/types/response';
import { api } from './base';

export interface User {
    id: string;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    blocked: number;
    type: 'USER' | 'ADMIN';
}

export function getAllUsers<T>(
    page?: number,
    options?: { status_type?: 'all' | 'blocked' | 'unblocked' }
) {
    const query = { page: page || 1 } as {
        status_type?: 'all' | 'blocked' | 'unblocked';
        page?: number;
    };
    if (options?.status_type) query.status_type = options.status_type;
    return api<T>(`/user/users`, {
        method: 'get',
        query,
    });
}

export function getUserById(userId: string) {
    return api<APIResponse<User>>(`/user/user-info/${userId}`, {
        method: 'get',
    });
}

export function searchUsersByName<T>(
    name: string,
    options?: { status_type?: 'all' | 'blocked' }
) {
    const query = { name } as {
        status_type?: 'all' | 'blocked';
    };
    if (options?.status_type) query.status_type = options.status_type;
    return api<T>(`/user/search-users`, {
        method: 'get',
        query,
    });
}

export function deleteUser(userID: string) {
    return api(`/user/${userID}`, {
        method: 'delete',
    });
}

export function changeUserStatus(userID: string, blocked: 1 | 0) {
    return api(`/user/${userID}/update-status`, {
        method: 'patch',
        body: JSON.stringify({ blocked }),
    });
}
