<script setup lang="ts">
import { getOrderOptions, addOrder } from '~/api/order.api';
import { units } from "~/utils/unit-type"

const props = defineProps<{
    id: string;
    title: string;
    descriptions: string;
    slug: string;
    showEdit: boolean;
}>();

const emits = defineEmits<{
    (e: 'onSave', v: any[]): void;
    (e: 'editItem', v: typeof props): void;
    (e: 'deleteItem', v: string): void;
}>();
const toast = useAppToast();
const open = ref(false);
const creatingOrder = ref(false);

interface OPT {
    text: string;
    value: string;
}

const orderItemsOptions = ref<OPT[]>([]);

const orderInput = reactive({
    unitAmount: 0,
    unitType: '',
    name: '',
});
const orderErrors = ref<null | string>(null);

const updateName = (val: OPT) => (orderInput.name = val.text);

function fetchOptions() {
    getOrderOptions(props.slug).then((res: any) => {
        orderItemsOptions.value = res.data.map((item: any) => ({
            text: item.name,
            value: item.value,
        }));
    });
}

watch(open, isOpen => {
    if (isOpen) {
        if (!orderItemsOptions.value.length) {
            fetchOptions();
        }
    } else {
        orderInput.name = '';
        orderInput.unitAmount = 0;
        orderInput.unitType = '';
    }
});
async function createNewOrder() {
    if (
        orderInput.name === '' ||
        orderInput.unitAmount === 0 ||
        orderInput.unitType === ''
    ) {
        orderErrors.value = 'please full file all the fields';
        return;
    } else {
        orderErrors.value = null;
    }

    creatingOrder.value = true;
    try {
        await addOrder({
            name: orderInput.name,
            amount: orderInput.unitAmount,
            unit_type: orderInput.unitType,
            sub_category: props.slug,
        });
        creatingOrder.value = false;
        open.value = false;
        toast.successToast('order added');
    } catch (err: any) {
        creatingOrder.value = false;
        toast.successToast(err.message);
    }
}
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
        <UiDialog v-model:open="open">
            <UiDialogTrigger :to="props.slug">
                <UiButton class="w-full">Order</UiButton>
            </UiDialogTrigger>
            <UiDialogContent class="max-w-2xl text-gray-900 border-none">
                <UiDialogHeader>
                    <UiDialogTitle class="text-gray-900">
                        Add Orders
                    </UiDialogTitle>
                    <UiDialogDescription class="flex flex-col gap-y-3">
                        <div class="flex gap-x-3">
                            <AppAutoComplete
                                :options="orderItemsOptions"
                                placeholder="Product name"
                                class="flex-grow"
                                :clearAble="true"
                                :showAddButton="false"
                                :focusOnFirstTime="false"
                                @itemSelect="updateName"
                                @updateSearch="v => (orderInput.name = v)"
                            />
                            <UiInput
                                placeholder="Unit"
                                v-model="orderInput.unitAmount"
                                label="Unit"
                                class="w-[20%]"
                            />
                            <div class="w-[30%]">
                                <UiSelect v-model="orderInput.unitType">
                                    <UiSelectTrigger>
                                        <UiSelectValue
                                            placeholder="Unit Type"
                                        />
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
                        </div>
                        <p v-show="orderErrors" class="text-red-500 text-sm">
                            {{ orderErrors }}
                        </p>
                    </UiDialogDescription>
                </UiDialogHeader>
                <UiDialogFooter>
                    <UiButton @click="createNewOrder" :disabled="creatingOrder">
                        <div
                            v-if="creatingOrder"
                            class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                        ></div>
                        Save changes
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
    </div>
</template>
