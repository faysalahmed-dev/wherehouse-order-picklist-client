<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import OrderAction from '~/components/app/tables/OrderAction.vue';
import {
    getAllUsers,
    searchUsersByName,
    changeUserStatus,
    deleteUser as apiDeleteUser,
} from '~/api/users.api';
import type { Option } from '~/components/app/AutoComplete.vue';

interface UserList {
    id: string;
    name: string;
    email: string;
    user_type: 'USER';
    blocked: boolean;
    total_orders: number;
    created_at: Date;
}
const tableData = ref<UserList[]>([]);

const columns: ColumnDef<UserList>[] = [
    {
        header: 'Name',
        accessorKey: 'name',
    },
    {
        header: 'Email',
        accessorKey: 'email',
    },
    {
        header: 'blocked',
        cell: ({ row }) => {
            return h(
                'p',
                {
                    class: `px-2 rounded-lg text-center text-white inline-block ${
                        row.original.blocked ? 'bg-red-500' : 'bg-green-500'
                    }`,
                },
                row.original.blocked
            );
        },
    },
    {
        header: 'Total Orders',
        accessorKey: 'total_orders',
    },
    {
        header: 'Created Date',
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
        header: 'Actions',
        enableHiding: false,
        cell: ({ row }) => {
            const options = [
                row.original.blocked ? 'UnBlock' : 'Block',
                'Delete',
            ];
            return h(OrderAction, {
                options,
                onItemClick,
                rawValue: row.original,
            });
        },
    },
];

const filterOptions = {
    statusType: [
        { text: 'All', value: 'all' },
        { text: 'Blocked', value: 'blocked' },
        { text: 'Active', value: 'unblocked' },
    ],
};

const filterBy = reactive({
    statusType: 'all' as any,
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
        fetchUses(currentPage, { status_type: filterBy.statusType });
    }
);

watch(filterBy, ({ statusType }) => {
    if (tableOptions.page !== 1) {
        tableOptions.page = 1;
    } else {
        fetchUses(1, { status_type: statusType });
    }
});

function fetchUses(
    page: number,
    opt?: { status_type?: 'all' | 'blocked' | 'unblocked' }
) {
    tableOptions.loading = true;
    getAllUsers(page, opt)
        .then((res: any) => {
            console.log(res);
            tableData.value = res.data;
            tableOptions.itemPerPage = res.limit;
            tableOptions.totalItems = res.total_items;
            tableOptions.totalPages = res.total_pages;

            console.log(tableOptions.totalItems);
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
        await apiDeleteUser(currentDeleteItem.value);
        currentDeleteItem.value = null;
        toast.successToast('successfully deleted');
        fetchUses(tableOptions.page);
    } catch (err: any) {
        toast.errorToast(err.message);
        currentDeleteItem.value = null;
    }
});

const userStatusChangeItemSnap = ref<null | { id: string; status: boolean }>(
    null
);
onDelete('user_status', async function () {
    if (!userStatusChangeItemSnap.value || !userStatusChangeItemSnap.value.id)
        return;
    try {
        await changeUserStatus(
            userStatusChangeItemSnap.value.id,
            userStatusChangeItemSnap.value.status
        );
        userStatusChangeItemSnap.value = null;
        toast.successToast('successfully change user status');
        fetchUses(tableOptions.page);
    } catch (err: any) {
        userStatusChangeItemSnap.value = null;
        toast.errorToast(err.message);
    }
});

function onItemClick(actionName: string, itemSnap: any) {
    if (actionName === 'Delete') {
        currentDeleteItem.value = itemSnap.id;
        deleteItem('order_item');
    } else if (actionName === 'Block') {
        userStatusChangeItemSnap.value = { id: itemSnap.id, status: true };
        deleteItem('user_status', 'Save');
    } else if (actionName === 'UnBlock') {
        userStatusChangeItemSnap.value = { id: itemSnap.id, status: false };
        deleteItem('user_status', 'Save');
    }
}
const searchingUser = ref(false);
const searchUserOptions = ref<UserList[]>([]);
const searchFilterUser = ref<UserList[]>([]);
async function searchUser(query: string) {
    if (!query.length) return;
    try {
        searchingUser.value = true;
        const result = await searchUsersByName(query);
        searchUserOptions.value = (result as any).data;
        searchingUser.value = false;
    } catch (err) {
        searchingUser.value = false;
    }
}
function setSearchFilterUserToTable({ value }: { value: string }) {
    const hasUser = searchUserOptions.value.find(item => item.id === value);
    if (hasUser) {
        searchFilterUser.value = [{ ...hasUser }];
    } else {
        searchFilterUser.value = [];
    }
}

onMounted(() => {
    fetchUses(1);
});
</script>

<template>
    <div class="py-6">
        <h2 class="font-bold text-3xl mb-7">User List</h2>
        <div class="flex justify-between items-end mb-6">
            <div>
                <p>Filters:</p>
                <div class="flex gap-4">
                    <div>
                        <p class="mb-1 font-bold">Status:</p>
                        <AppAutoComplete
                            :options="filterOptions.statusType"
                            :show-add-button="false"
                            @itemSelect="
                                value => (filterBy.statusType = value.value)
                            "
                            @clear="
                                !!filterBy.statusType &&
                                    (filterBy.statusType = null)
                            "
                        />
                    </div>
                </div>
            </div>
            <div>
                <p class="font-bold">Search:</p>
                <div class="flex gap-4">
                    <AppAutoComplete
                        :options="
                            searchUserOptions.map(({ name, id }) => ({
                                text: name,
                                value: id,
                            }))
                        "
                        :show-add-button="false"
                        :debounce="500"
                        @update-search="searchUser"
                        @itemSelect="setSearchFilterUserToTable"
                        @clear="searchFilterUser = []"
                        :search-loading="searchingUser"
                    />
                </div>
            </div>
        </div>
        <AppTablesOrderTable
            v-model:page="tableOptions.page"
            :columns="columns"
            :tableData="searchFilterUser.length ? searchFilterUser : tableData"
            :itemPerPage="tableOptions.itemPerPage"
            :totalItems="tableOptions.totalItems"
            :loading="tableOptions.loading"
            @reload="
                fetchUses(tableOptions.page, {
                    status_type: filterBy.statusType,
                })
            "
        />
    </div>
</template>
