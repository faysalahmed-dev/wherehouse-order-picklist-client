<script setup lang="ts">
const open = ref(false);

const isLargeScreen = useMediaQuery('(min-width: 1024px)');

watch(isLargeScreen, v => {
    if (!open.value && v) open.value = true;
    if (open.value && !v) open.value = false;
});

function handleSidebarLinkClick() {
    if (!isLargeScreen.value && open.value) {
        open.value = false;
    }
}

onMounted(() => {
    open.value = isLargeScreen.value;
});
</script>

<template>
    <main class="flex h-screen w-full">
        <div
            class="h-full w-52 shrink-0 top-0 left-0 z-20 transition-transform duration-200 ease-in-out"
            :class="[
                open
                    ? 'transform translate-x-0'
                    : 'transform -translate-x-full',
                isLargeScreen ? '' : 'absolute',
            ]"
        >
            <button
                v-if="!isLargeScreen"
                class="p-3 top-0 right-1 absolute z-20"
                @click="open = false"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="none"
                        stroke="#000"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m18 18l-6-6m0 0L6 6m6 6l6-6m-6 6l-6 6"
                    />
                </svg>
            </button>
            <AppSidebar @sidebar-link-click="handleSidebarLinkClick" />
        </div>
        <div class="w-full h-full p-[15px] lg:py-2">
            <button class="" v-if="!isLargeScreen" @click="open = true">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="none"
                        stroke="#000"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 18H4m16-4H4m16-4H4m16-4H4"
                    />
                </svg>
            </button>
            <slot />
        </div>
    </main>
</template>
