<script setup lang="ts">
const props = defineProps<{
    options: string[];
    rawValue: any;
}>();
const emits = defineEmits<{
    (e: 'itemClick', value: string, rawValue: any): void;
}>();
</script>

<template>
    <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
            <UiButton variant="outline" class="ml-auto">
                <svg
                    class="rotate-90"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="currentColor"
                        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
                    />
                </svg>
            </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end">
            <UiDropdownMenuCheckboxItem
                class="cursor-pointer"
                v-for="option in props.options"
                :key="option"
                @click="emits('itemClick', option, rawValue)"
            >
                {{ option }}
            </UiDropdownMenuCheckboxItem>
        </UiDropdownMenuContent>
    </UiDropdownMenu>
</template>
