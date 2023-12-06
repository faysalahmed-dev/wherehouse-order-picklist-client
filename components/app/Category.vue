<script setup lang="ts">
import type { SubCategory } from '~/api/sub-category.api';

const props = defineProps<{
    data: SubCategory;
    showEdit: boolean;
}>();

const emits = defineEmits<{
    (e: 'onSave', v: any[]): void;
    (e: 'editItem', v: SubCategory): void;
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
                    <UiDropdownMenuItem @click="emits('editItem', props.data)">
                        Edit
                    </UiDropdownMenuItem>
                    <UiDropdownMenuItem
                        @click="emits('deleteItem', props.data.id)"
                    >
                        Delete
                    </UiDropdownMenuItem>
                </UiDropdownMenuContent>
            </UiDropdownMenu>
        </div>
        <h3 class="text-2xl font-bold">{{ props.data.name }}</h3>
        <p class="opacity-95 flex-grow">{{ props.data.description }}</p>
        <NuxtLink
            :to="`/categories/${props.data.category.value}/${props.data.value}`"
            class="w-full"
        >
            <UiButton size="sm" class="w-full"> View Product </UiButton>
        </NuxtLink>
    </div>
</template>
