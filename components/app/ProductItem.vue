<script setup lang="ts">
const props = defineProps<{
    productName: string;
    productId?: string;
    orderId?: string;
    hasOrder?: boolean;
    deletingOrder?: boolean;
}>();

const amount = defineModel('amount', {
    default: '',
});
const type = defineModel('type', {
    default: '',
});
const emits = defineEmits<{
    (e: 'deleteItem', v: { orderId: string; productId: string }): void;
}>();
</script>

<template>
    <div>
        <div class="flex gap-x-3">
            <UiInput
                placeholder="Unit"
                label="Unit"
                class="w-[60%]"
                :modelValue="props.productName"
                readonly
            />
            <UiInput
                placeholder="Unit"
                v-model="amount"
                label="Unit"
                class="w-[20%]"
            />
            <div class="w-[30%]">
                <UiSelect v-model="type">
                    <UiSelectTrigger>
                        <UiSelectValue placeholder="Unit Type" />
                    </UiSelectTrigger>
                    <UiSelectContent class="border-none">
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="unit in units"
                                :value="unit.value"
                                :key="unit.value"
                                class="hover:bg-gray-200 cursor-pointer"
                            >
                                {{ unit.text }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>
            <div
                v-if="deletingOrder"
                class="animate-spin bg-transparent border-2 border-black border-r-transparent w-3 h-3 rounded-full m-auto"
            ></div>
            <template v-else>
                <button
                    v-if="props.hasOrder"
                    class="text-red-600 active:scale-90"
                    @click="
                        emits('deleteItem', {
                            orderId: props.orderId || '',
                            productId: props.productId || '',
                        })
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M4 5h3V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1h3a1 1 0 0 1 0 2h-1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4a1 1 0 1 1 0-2Zm3 2v13h10V7H7Zm2-2h6V4H9v1Zm0 4h2v9H9V9Zm4 0h2v9h-2V9Z"
                        />
                    </svg>
                </button>
            </template>
        </div>
    </div>
</template>
