import { useUserStore } from '~/store/user.store';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore();
    const isLoggedIn = !!(userStore.value.token && userStore.value.user);
    if (
        isLoggedIn &&
        !(to.name === 'auth-login' || to.name === 'auth-register')
    ) {
        return;
    } else if (
        !isLoggedIn &&
        (to.name === 'auth-login' || to.name === 'auth-register')
    ) {
        return;
    } else if (
        isLoggedIn &&
        (to.name === 'auth-login' || to.name === 'auth-register') &&
        to.path !== '/'
    ) {
        return navigateTo('/');
    }
    if (to.name !== 'auth-login') {
        return navigateTo('/auth/login');
    }
});
