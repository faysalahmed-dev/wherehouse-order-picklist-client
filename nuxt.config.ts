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
            baseURL: 'http://localhost:4000',
        },
    },
    components: [
        {
            path: '~/components/ui',
            // this is required else Nuxt will autoImport `.ts` file
            extensions: ['.vue'],
            // prefix for your components, eg: UiButton
            prefix: 'Ui',
        },
        {
            path: '~/components/app',
            // this is required else Nuxt will autoImport `.ts` file
            extensions: ['.vue'],
            // prefix for your components, eg: UiButton
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
