<script setup lang="ts">
import { onMounted } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';

import type { User } from '~/api/users.api';
import {
    getSingleUserOrders,
    deleteOrder,
    updateOrder as updateOrderAPI,
    updateStatus,
    myOrders,
} from '~/api/order.api';
import type { Order } from '~/api/order.api';

import OrderAction from '~/components/app/tables/OrderAction.vue';
import type { PaginationAPIResponse } from '~/types/response';
import { useUserStore } from '~/store/user.store';

const props = defineProps<{
    user: User | null;
    pageLoading: boolean;
}>();
const auth = useUserStore();
const openEditModel = ref(false);
const tableData = ref<Order[]>([]);

const columns: ColumnDef<Order>[] = [
    {
        header: 'Product',
        cell: ({ row }) =>
            h('h2', { class: 'font-bold' }, row.original.product.name),
    },
    {
        header: 'Status',
        cell: ({ row }) => {
            return h(
                'p',
                {
                    class: `px-2 rounded-lg text-center text-white inline-block ${
                        row.original.status === 'DONE'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                    }`,
                },
                row.original.status
            );
        },
    },
    {
        header: 'Amount',
        cell: ({ row }) => {
            return h(
                'p',
                { class: 'relative' },
                row.original.amount + ' ' + row.original.unit
            );
        },
    },
    {
        header: 'Category',
        accessorFn: ({ product }) => product.subCategory.category.name,
    },
    {
        header: 'SubCategory',
        accessorFn: ({ product }) => product.subCategory.name,
    },
    {
        header: 'Date',
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
            const formatedDate = useDateFormat(
                row.original.updated_at,
                'h:m a, D/M/YYYY'
            );
            return h('p', {}, formatedDate.value);
        },
    },
    {
        header: 'Actions',
        cell: ({ row }) => {
            const options = ['Edit', 'Delete'];
            if (auth.value.user?.type === 'ADMIN') {
                row.original.status === 'DONE'
                    ? (options[2] = 'Mark as Pending')
                    : (options[2] = 'Mark as Done');
            }
            return h(OrderAction, {
                options,
                onItemClick,
                rawValue: row.original,
            });
        },
    },
];

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
        fetchOrders(currentPage);
    }
);

async function fetchOrders(page: number) {
    if (!props.user) return;
    tableOptions.loading = true;
    let res: PaginationAPIResponse<Order[]>;
    try {
        if (auth.value.user!.type === 'ADMIN') {
            res = await getSingleUserOrders(props.user.id, page);
        } else {
            res = await myOrders(page);
        }
        tableData.value = res.data;
        tableOptions.itemPerPage = res.limit;
        tableOptions.totalItems = res.total_items;
        tableOptions.totalPages = res.total_pages;
    } catch (err) {
    } finally {
        tableOptions.loading = false;
    }
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

const orderEditItem = ref<null | Order>(null);
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
        orderInput.name = itemSnap.product.name;
        orderInput.unitType = itemSnap.unit;
        orderEditItem.value = itemSnap;
    } else if (
        actionName === 'Mark as Done' ||
        actionName === 'Mark as Pending'
    ) {
        updateStatus(
            itemSnap.id,
            actionName === 'Mark as Done' ? 'DONE' : 'PENDING'
        )
            .then(() => {
                toast.successToast('successfully status updated');
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
        orderInput.unitAmount == 0 ||
        orderInput.unitType === ''
    ) {
        orderErrors.value = 'please full file all the fields';
        return;
    } else {
        orderErrors.value = null;
    }
    if (!orderEditItem.value) return;
    updatingOrder.value = true;
    updateOrderAPI((orderEditItem.value as any).id, {
        amount: +orderInput.unitAmount,
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

let loaded = false;
watch(
    () => props.pageLoading,
    isLoading => {
        if (!loaded && !isLoading) {
            loaded = true;
            fetchOrders(1);
        }
    }
);
onMounted(() => {
    if (!loaded && !props.pageLoading) {
        loaded = true;
        fetchOrders(1);
    }
});

const isSaveButtonDisabled = computed(() => {
    let d =
        !orderInput.unitType || !orderInput.unitAmount || updatingOrder.value;
    if (orderEditItem.value) {
        return (
            d ||
            (orderEditItem.value.unit === orderInput.unitType &&
                orderEditItem.value.amount == orderInput.unitAmount)
        );
    }
    return d;
});
</script>
<template>
    <div class="py-6">
        <UiButton
            class="mb-3"
            @click="$router.back()"
            v-if="$route.path !== '/'"
            size="sm"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
            >
                <path
                    fill="currentColor"
                    d="m11.828 12l2.829 2.829l-1.414 1.414L9 12.001l4.243-4.243l1.414 1.414l-2.829 2.829Z"
                />
            </svg>
        </UiButton>
        <template v-if="pageLoading">
            <div
                class="animate-spin bg-transparent border-2 border-black border-r-transparent w-10 h-10 rounded-full mt-10 mx-auto"
            ></div>
        </template>
        <template v-else-if="!user">
            <h2 class="text-red-500 font-bold text-center py-6">
                User not found!
            </h2>
        </template>
        <template v-else>
            <h2 class="font-bold text-3xl mb-7">
                {{ props.user?.name }} Orders
            </h2>
            <UiDialog v-model:open="openEditModel">
                <UiDialogContent class="max-w-2xl text-gray-900 border-none">
                    <UiDialogHeader>
                        <UiDialogTitle class="text-gray-900">
                            Edit Orders
                        </UiDialogTitle>
                        <UiDialogDescription class="flex flex-col gap-y-3">
                            <AppProductItem
                                :product-name="orderInput.name"
                                :has-order="false"
                                v-model:amount="orderInput.unitAmount"
                                v-model:type="orderInput.unitType"
                            />
                        </UiDialogDescription>
                    </UiDialogHeader>
                    <UiDialogFooter>
                        <UiButton
                            @click="updateOrder"
                            :disabled="isSaveButtonDisabled"
                        >
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
                @reload="fetchOrders(tableOptions.page)"
            />
        </template>
    </div>
</template>
