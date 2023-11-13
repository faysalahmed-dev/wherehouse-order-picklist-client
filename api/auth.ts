import { api } from './base';

export function loginUser<T>(data: { email: string; password: string }) {
    return api<T>(`/user/login`, {
        method: 'post',
        body: JSON.stringify(data),
    });
}
export function registerUser<T>(data: {
    email: string;
    password: string;
    name: string;
}) {
    return api<T>(`/user/register`, {
        method: 'post',
        body: JSON.stringify(data),
    });
}
