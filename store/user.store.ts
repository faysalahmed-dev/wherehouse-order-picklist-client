import { createGlobalState, useStorage } from '@vueuse/core';
import type { User } from '~/api/users.api';

export interface Auth {
    token: string | null;
    user: User | null;
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
