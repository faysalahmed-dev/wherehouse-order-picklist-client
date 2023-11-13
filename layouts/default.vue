<template>
    <main class="flex h-screen w-full">
        <div class="w-52 h-full shrink-0">
            <AppSidebar />
        </div>
        <div class="grow h-full">
            <slot />
        </div>
    </main>
</template>
