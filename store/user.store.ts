import { createGlobalState, useStorage } from '@vueuse/core';

export interface Auth {
    token: string | null;
    user: {
        email: string;
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        blocked: boolean;
        user_type: 'USER' | 'ADMIN';
    } | null;
}

const defaultValue = {
    token: null,
    user: null,
};

export const useUserStore = createGlobalState(() =>
    useStorage<Auth>('auth', defaultValue)
);

export const logoutUser = () => {
    const store = useUserStore();
    store.value.token = null;
    store.value.user = null;
    navigateTo('/auth/login');
};
