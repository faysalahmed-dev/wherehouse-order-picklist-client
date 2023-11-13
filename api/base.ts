import { useUserStore } from '~/store/user.store';

const { baseURL } = useRuntimeConfig().public;

export const api = <T>(path: string, options: any): Promise<T> => {
    const userStore = useUserStore();
    return new Promise((resolve, reject) => {
        $fetch(path, {
            baseURL: `${baseURL}/api/v1`,
            ...options,
            headers: {
                authorization: userStore.value.token
                    ? 'Bearer ' + userStore.value.token
                    : '',
            },
            onResponse: async ({ response }) => {
                if (response.status === 401) {
                    userStore.value.token = null;
                    userStore.value.user = null;
                    await navigateTo('/auth/login');
                    reject(response._data);
                } else if (response.ok) {
                    resolve(response._data);
                } else {
                    reject(response._data);
                }
            },
        });
    });
};
