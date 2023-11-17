import { api } from './base';

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

export function searchUsersByName<T>(
    name: string,
    options?: { status_type?: 'all' | 'blocked' | 'unblocked' }
) {
    const query = { name } as {
        status_type?: 'all' | 'blocked' | 'unblocked';
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

export function changeUserStatus(userID: string, status: boolean) {
    return api(`/user/${userID}`, {
        method: 'patch',
        body: JSON.stringify({ status }),
    });
}
