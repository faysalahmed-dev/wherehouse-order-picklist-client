<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, TableOptions } from '@tanstack/vue-table';
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    getPaginationRowModel,
} from '@tanstack/vue-table';

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[];
    tableData: TData[];
    totalItems: number;
    itemPerPage: number;
    loading: boolean;
}>();

const pageCount = defineModel('page', { default: 1 });

const tableOptions = reactive<TableOptions<TData>>({
    get data() {
        return props.tableData;
    },
    get columns() {
        return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true,
});
const table = useVueTable(tableOptions as any);

const emits = defineEmits<{
    (e: 'reload'): void;
}>();
</script>

<template>
    <div class="border rounded-md relative">
        <div
            class="absolute top-0 left-0 flex justify-center items-center h-full w-full bg-[#ffffff7d] z-10"
            v-if="props.loading"
        >
            <div
                class="animate-spin border-4 w-10 h-10 rounded-full border-black border-t-transparent"
            ></div>
        </div>
        <UiTable>
            <UiTableHeader>
                <UiTableRow
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                >
                    <UiTableHead
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                    >
                        <FlexRender
                            v-if="!header.isPlaceholder"
                            :render="header.column.columnDef.header"
                            :props="header.getContext()"
                        />
                    </UiTableHead>
                </UiTableRow>
            </UiTableHeader>

            <UiTableBody>
                <template v-if="table.getRowModel().rows?.length">
                    <UiTableRow
                        v-for="row in table.getRowModel().rows"
                        :key="row.id"
                        :data-state="
                            row.getIsSelected() ? 'selected' : undefined
                        "
                    >
                        <UiTableCell
                            v-for="cell in row.getVisibleCells()"
                            :key="cell.id"
                        >
                            <FlexRender
                                :render="cell.column.columnDef.cell"
                                :props="cell.getContext()"
                            />
                        </UiTableCell>
                    </UiTableRow>
                </template>
                <template v-else>
                    <UiTableRow>
                        <UiTableCell
                            :colSpan="columns.length"
                            class="h-24 text-center"
                        >
                            No results.
                        </UiTableCell>
                    </UiTableRow>
                </template>
            </UiTableBody>
        </UiTable>
        <div class="mt-6 px-4 py-3 flex justify-between">
            <AppTablesPagination
                :total-items="props.totalItems"
                :items-per-page="props.itemPerPage"
                v-model:page="pageCount"
                v-if="pageCount > 1"
            />
            <div class="flex gap-2 items-center ml-auto">
                <UiButton @click="emits('reload')" size="sm" variant="outline">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M12.079 2.25c-4.794 0-8.734 3.663-9.118 8.333H2a.75.75 0 0 0-.528 1.283l1.68 1.666a.75.75 0 0 0 1.056 0l1.68-1.666a.75.75 0 0 0-.528-1.283h-.893c.38-3.831 3.638-6.833 7.612-6.833a7.658 7.658 0 0 1 6.537 3.643a.75.75 0 1 0 1.277-.786A9.158 9.158 0 0 0 12.08 2.25Zm8.762 8.217a.75.75 0 0 0-1.054 0L18.1 12.133a.75.75 0 0 0 .527 1.284h.899c-.382 3.83-3.651 6.833-7.644 6.833a7.697 7.697 0 0 1-6.565-3.644a.75.75 0 1 0-1.277.788a9.197 9.197 0 0 0 7.842 4.356c4.808 0 8.765-3.66 9.15-8.333H22a.75.75 0 0 0 .527-1.284l-1.686-1.666Z"
                        />
                    </svg>
                </UiButton>
                <p>Total Items: {{ props.totalItems || 0 }}</p>
            </div>
        </div>
    </div>
</template>
