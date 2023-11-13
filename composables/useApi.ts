export const useAPI: typeof useLazyFetch = (path, options) => {
    const nuxtApp = useNuxtApp();
    const { baseURL } = useRuntimeConfig().public;
    return useFetch(path, {
        baseURL: `${baseURL}/api/v1`,
        deep: false,
        lazy: true,
        server: false,
        responseType: 'json',
        key: path as string,
        transform(data) {
            if (data && data.data) return data.data;
            return data;
        },
        // getCachedData(key) {
        //     if (options && options.useCache === false) {
        //         return null;
        //     }
        //     return nuxtApp.payload.data[key];
        // },
        onResponse({ response, error }) {
            if (error || !response.ok || response._data.error) {
                throw createError(response._data.message || error);
            }
        },
        ...options,
    });
};
