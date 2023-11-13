<script setup lang="ts">
import {
    Pagination,
    PaginationList,
    PaginationListItem,
} from '~/components/ui/pagination';
const props = withDefaults(
    defineProps<{
        totalItems: number;
        itemsPerPage: number;
    }>(),
    {
        itemsPerPage: 15,
    }
);

const page = defineModel('page', { default: 1 });
</script>

<template>
    <Pagination
        v-model:page="page"
        :total="props.totalItems"
        :sibling-count="1"
        :items-per-page="props.itemsPerPage"
        show-edges
    >
        <PaginationList v-slot="{ items }" class="flex items-center gap-1">
            <UiPaginationFirst />
            <UiPaginationPrev />

            <template v-for="(item, index) in items">
                <PaginationListItem
                    v-if="item.type === 'page'"
                    :key="index"
                    :value="item.value"
                    as-child
                >
                    <UiButton
                        class="w-10 h-10 p-0"
                        :variant="item.value === page ? 'default' : 'outline'"
                        :disabled="item.value === page"
                    >
                        {{ item.value }}
                    </UiButton>
                </PaginationListItem>
                <UiPaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <UiPaginationNext />
            <UiPaginationLast />
        </PaginationList>
    </Pagination>
</template>
