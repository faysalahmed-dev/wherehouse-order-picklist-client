<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { useUserStore } from '~/store/user.store';
import { getAllOrdersByUser, gerUserOptions } from '~/api/order.api';
import type { GroupOrderByUser } from '~/api/order.api';
import { NuxtLink } from '#components';

const user = useUserStore();
const tableData = ref<GroupOrderByUser[]>([]);

const columns: ColumnDef<GroupOrderByUser>[] = [
    {
        header: 'Name',
        accessorKey: 'name',
    },
    {
        header: 'Email',
        accessorKey: 'email',
    },
    {
        header: 'Total',
        accessorKey: 'total',
    },
    {
        header: 'Picked',
        accessorKey: 'picked',
    },
    {
        header: 'Last Order',
        cell: ({ row }) => {
            const formatedDate = useDateFormat(
                row.original.last_submission,
                'h:m a, D/M/YYYY'
            );
            return h('p', {}, formatedDate.value);
        },
    },
    {
        header: 'Details',
        cell: ({ row }) => {
            return h(
                NuxtLink,
                {
                    to: `/view-orders/${row.original.user_id}`,
                    class: 'text-green-500 fw-bold',
                },
                'View More'
            );
        },
    },
];
const filterOptions = reactive({
    users: [],
});

const filterBy = reactive({
    user: undefined as undefined | string,
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
        fetchOrders(currentPage, filterBy.user);
    }
);

watch(filterBy, ({ user }) => {
    if (tableOptions.page !== 1) {
        tableOptions.page = 1;
    } else {
        fetchOrders(1, user);
    }
});

function fetchOrders(page: number, userId?: string) {
    tableOptions.loading = true;
    getAllOrdersByUser(page, userId)
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

onMounted(() => {
    fetchOrders(1);
    gerUserOptions().then((res: any) => {
        filterOptions.users = res.data.map((item: any) => ({
            text: item.name,
            value: item.id,
        }));
    });
});
</script>

<template>
    <div class="py-6">
        <h2 class="font-bold text-3xl mb-7">All Orders</h2>
        <div class="flex justify-between items-end mb-6">
            <div>
                <p class="opacity-90 font-bold">Filters:</p>
                <div class="flex gap-4">
                    <div>
                        <p class="mb-1 font-medium">User</p>
                        <AppAutoComplete
                            :options="filterOptions.users"
                            :show-add-button="false"
                            @itemSelect="value => (filterBy.user = value.value)"
                            @clear="
                                !!filterBy.user && (filterBy.user = undefined)
                            "
                        />
                    </div>
                </div>
            </div>
        </div>
        <template v-if="user.user?.type === 'ADMIN'">
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
