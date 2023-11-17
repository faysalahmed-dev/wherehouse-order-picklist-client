<template>
    <UiToastToaster class="absolute" />
    <NuxtLayout>
        <AppDeleteConformation />
        <NuxtPage />
    </NuxtLayout>
</template>
<style>
[role='region'][aria-label='Notifications (F8)'] {
    height: 0;
}
.router-link-active {
    @apply text-emerald-500;
}
</style>
<style scoped>
body {
    @apply text-gray-50;
}
</style>
