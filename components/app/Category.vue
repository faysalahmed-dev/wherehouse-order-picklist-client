<script setup lang="ts">
const props = defineProps<{
    id: string;
    title: string;
    descriptions: string;
    slug: string;
    showEdit: boolean;
    path: string;
}>();

const emits = defineEmits<{
    (e: 'onSave', v: any[]): void;
    (e: 'editItem', v: typeof props): void;
    (e: 'deleteItem', v: string): void;
}>();
</script>
<template>
    <div
        class="rounded-md p-3 text-gray-900 flex gap-y-3 flex-col border border-gray-300 relative"
    >
        <div class="absolute right-1 top-1" v-if="showEdit">
            <UiDropdownMenu>
                <UiDropdownMenuTrigger>
                    <IconThreeDot />
                </UiDropdownMenuTrigger>
                <UiDropdownMenuContent>
                    <UiDropdownMenuItem @click="emits('editItem', props)">
                        Edit
                    </UiDropdownMenuItem>
                    <UiDropdownMenuItem @click="emits('deleteItem', props.id)">
                        Delete
                    </UiDropdownMenuItem>
                </UiDropdownMenuContent>
            </UiDropdownMenu>
        </div>
        <h3 class="text-2xl font-bold">{{ props.title }}</h3>
        <p class="opacity-95 flex-grow">{{ props.descriptions }}</p>
        <NuxtLink :to="path" class="w-full">
            <UiButton size="sm" class="w-full"> View Product </UiButton>
        </NuxtLink>
    </div>
</template>
