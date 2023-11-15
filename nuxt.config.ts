// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/tailwindcss',
        '@vueuse/nuxt',
        'nuxt-typed-router',
        '@vee-validate/nuxt',
    ],
    ssr: false,
    vite: {
        vue: {
            script: {
                defineModel: true,
            },
        },
    },
    runtimeConfig: {
        public: {
            baseURL: process.env.API_BASE_URL,
        },
    },
    components: [
        {
            path: '~/components/ui',
            extensions: ['.vue'],
            prefix: 'Ui',
        },
        {
            path: '~/components/app',
            extensions: ['.vue'],
            prefix: 'App',
        },
        {
            path: '~/components/tables',
            global: true,
        },
        {
            path: '~/components/icons',
            prefix: 'Icon',
        },
    ],
});
