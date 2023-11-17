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
            <p class="ml-auto">Total Items: {{ props.totalItems || 0 }}</p>
        </div>
    </div>
</template>
