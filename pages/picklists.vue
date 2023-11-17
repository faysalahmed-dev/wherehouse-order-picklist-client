<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import OrderAction from '~/components/app/tables/OrderAction.vue';
import { getAllCategoriesOptions } from '~/api/category.api';
import { getAllSubCategoriesOptions } from '~/api/sub-category.api';
import { useUserStore } from '~/store/user.store';
import { units } from '~/utils/unit-type';
import {
    updateOrder as apiUpdateOrder,
    updateStatus,
    getOrdersByStatus,
    deleteOrder,
} from '~/api/order.api';

interface Orders {
    id: string;
    name: string;
    category: string;
    sub_category: string;
    amount: number;
    unit_type: string;
    created_at: string;
    user: string;
    status: 'UNPICKED' | 'PICKED';
}
const openEditModel = ref(false);
const user = useUserStore();
const tableData = ref<Orders[]>([]);

const columns: ColumnDef<Orders>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) =>
    //         h(Checkbox, {
    //             checked: table.getIsAllPageRowsSelected(),
    //             'onUpdate:checked': value =>
    //                 table.toggleAllPageRowsSelected(!!value),
    //             ariaLabel: 'Select all',
    //         }),
    //     cell: ({ row }) =>
    //         h(Checkbox, {
    //             checked: row.getIsSelected(),
    //             'onUpdate:checked': value => row.toggleSelected(!!value),
    //             ariaLabel: 'Select row',
    //         }),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
        header: 'Item',
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: true,
        accessorKey: 'name',
    },
    {
        header: 'Status',
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: false,
        cell: ({ row }) => {
            return h(
                'p',
                {
                    class: `px-2 rounded-lg text-center text-white inline-block ${
                        row.original.status === 'UNPICKED'
                            ? 'bg-red-500'
                            : 'bg-green-500'
                    }`,
                },
                row.original.status
            );
        },
    },
    {
        header: 'Amount',
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: false,
        cell: ({ row }) => {
            return h(
                'p',
                { class: 'relative' },
                row.original.amount + ' ' + row.original.unit_type
            );
        },
    },
    {
        header: 'Category',
        enableSorting: true,
        enableColumnFilter: true,
        // accessorKey: 'category',
        cell: ({ row }) => {
            return h(
                'p',
                { class: 'relative' },
                // @ts-ignore
                row.original.edges?.sub_categories?.edges?.category?.name
            );
        },
    },
    {
        header: 'SubCategory',
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
            return h(
                'p',
                { class: 'relative' },
                // @ts-ignore
                row.original.edges?.sub_categories?.name
            );
        },
    },
    {
        header: 'Date',
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
            const formatedDate = useDateFormat(
                row.original.created_at,
                'h:m a, D/M/YYYY'
            );
            return h('p', {}, formatedDate.value);
        },
    },
    {
        header: 'User',
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
            //@ts-ignore
            return h('p', {}, row.original.edges?.user?.name);
        },
    },
    {
        header: 'Actions',
        enableHiding: false,
        cell: ({ row }) => {
            const options = ['Edit', 'Delete'];
            if (user.value.user?.user_type === 'ADMIN')
                options.unshift('Add to Pick List');
            return h(OrderAction, {
                options,
                onItemClick,
                rawValue: row.original,
            });
        },
    },
];
const filterOptions = reactive({
    categories: [],
    subCategories: [],
});

const filterBy = reactive({
    category: null as null | string,
    subCategory: null as null | string,
});
const tableOptions = reactive({
    page: 1,
    totalItems: 0,
    itemPerPage: 15,
    loading: false,
    totalPages: 0,
});

watch(
    () => tableOptions.page,
    currentPage => {
        fetchOrders(currentPage, {
            category: filterBy.category,
            sub_category: filterBy.subCategory,
        });
    }
);

watch(filterBy, ({ category, subCategory }) => {
    if (tableOptions.page !== 1) {
        tableOptions.page = 1;
    } else {
        fetchOrders(1, {
            category: category,
            sub_category: subCategory,
        });
    }

    if (category) {
        getAllSubCategoriesOptions(category).then((res: any) => {
            filterOptions.subCategories = res.data.map((item: any) => ({
                text: item.name,
                value: item.value,
            }));
        });
    } else {
        filterOptions.subCategories = [];
    }
});

function fetchOrders(
    page: number,
    opt?: { category: string | null; sub_category: string | null }
) {
    tableOptions.loading = true;
    getOrdersByStatus(page, opt)
        .then((res: any) => {
            tableData.value = res.data;
            tableOptions.itemPerPage = res.limit;
            tableOptions.totalItems = res.total_items;
            tableOptions.totalPages = res.total_pages;
        })
        .finally(() => {
            tableOptions.loading = false;
        });
}

const toast = useAppToast();

const currentDeleteItem = ref<string | null>(null);
const { onDelete, deleteItem, open: isDialogOpen } = useDeleteConfirmation();

watch(isDialogOpen, (cur, pre) => {
    if (pre && !cur) {
        currentDeleteItem.value = null;
    }
});

onDelete('order_item', async function () {
    if (!currentDeleteItem.value) return;
    try {
        await deleteOrder(currentDeleteItem.value);
        currentDeleteItem.value = null;
        toast.successToast('successfully deleted');
        fetchOrders(tableOptions.page);
    } catch (err: any) {
        toast.errorToast(err.message);
    }
});

const orderEditItem = ref(null);
const orderInput = reactive({
    unitAmount: 0,
    unitType: '',
    name: '',
});
const orderErrors = ref<null | string>(null);
const updatingOrder = ref(false);

function onItemClick(actionName: string, itemSnap: any) {
    if (actionName === 'Delete') {
        currentDeleteItem.value = itemSnap.id;
        deleteItem('order_item');
    } else if (actionName === 'Edit') {
        openEditModel.value = true;
        orderInput.unitAmount = itemSnap.amount;
        orderInput.name = itemSnap.name;
        orderInput.unitType = itemSnap.unit_type;
        orderEditItem.value = itemSnap;
    } else if (actionName === 'Add to Pick List') {
        updateStatus(itemSnap.id, 1)
            .then(() => {
                toast.successToast('added to pick list');
                fetchOrders(tableOptions.page);
            })
            .catch((err: any) => {
                toast.errorToast(err.message);
            });
    }
}

watch(openEditModel, isOpen => {
    if (!isOpen) {
        orderInput.unitAmount = 0;
        orderInput.name = '';
        orderInput.unitType = '';
        orderEditItem.value = null;
    }
});

function updateOrder() {
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
    if (!orderEditItem.value) return;
    updatingOrder.value = true;
    apiUpdateOrder((orderEditItem.value as any).id, {
        name: orderInput.name,
        amount: orderInput.unitAmount,
        unit_type: orderInput.unitType,
    })
        .then(() => {
            updatingOrder.value = false;
            openEditModel.value = false;
            toast.successToast('successfully update order');
            fetchOrders(tableOptions.page);
        })
        .catch(err => {
            updatingOrder.value = false;
            toast.successToast(err.message);
        });
}

onMounted(() => {
    fetchOrders(1);
    getAllCategoriesOptions().then((res: any) => {
        filterOptions.categories = res.data.map((item: any) => ({
            text: item.name,
            value: item.value,
        }));
    });
});
</script>

<template>
    <div class="py-6">
        <h2 class="font-bold text-3xl mb-7">Pick List</h2>
        <div class="flex justify-between items-end mb-6">
            <div>
                <p>Filters:</p>
                <div class="flex gap-4">
                    <div>
                        <p class="mb-1">Category</p>
                        <AppAutoComplete
                            :options="filterOptions.categories"
                            :show-add-button="false"
                            @itemSelect="
                                value => (filterBy.category = value.value)
                            "
                            @clear="
                                !!filterBy.category &&
                                    (filterBy.category = null)
                            "
                        />
                    </div>
                    <div>
                        <p class="mb-1">SubCategory</p>
                        <AppAutoComplete
                            :options="filterOptions.subCategories"
                            v-model:selected="filterBy.category"
                            :show-add-button="false"
                            :disabled="!!!filterBy.category"
                            @itemSelect="
                                value => (filterBy.subCategory = value.value)
                            "
                            @clear="
                                !!filterBy.subCategory &&
                                    (filterBy.subCategory = null)
                            "
                        />
                    </div>
                </div>
            </div>
            <div>
                <p>Search:</p>
                <div class="flex gap-4">
                    <UiInput type="text" />
                </div>
            </div>
        </div>
        <UiDialog v-model:open="openEditModel">
            <UiDialogContent class="max-w-2xl text-gray-900 border-none">
                <UiDialogHeader>
                    <UiDialogTitle class="text-gray-900">
                        Edit Orders
                    </UiDialogTitle>
                    <UiDialogDescription class="flex flex-col gap-y-3">
                        <div class="flex gap-x-3">
                            <UiInput
                                placeholder="Product Name.."
                                label="Product Name"
                                class="flex-grow"
                                v-model="orderInput.name"
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
                    <UiButton @click="updateOrder" :disabled="updatingOrder">
                        <div
                            v-if="updatingOrder"
                            class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                        ></div>
                        Save changes
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
        <AppTablesOrderTable
            v-model:page="tableOptions.page"
            :columns="columns"
            :tableData="tableData"
            :itemPerPage="tableOptions.itemPerPage"
            :totalItems="tableOptions.totalItems"
            :loading="tableOptions.loading"
        />
    </div>
</template>
