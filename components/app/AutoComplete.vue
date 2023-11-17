<script setup lang="ts">
export interface Option {
    text: string;
    value: string;
}
const loading = ref(false);
const props = withDefaults(
    defineProps<{
        options: Option[];
        showAddButton?: boolean;
        debounce?: number;
        clearAble?: boolean;
        disabled?: boolean;
        focusOnFirstTime?: boolean;
        label?: string;
        searchLoading?: boolean;
    }>(),
    {
        showAddButton: true,
        debounce: 500,
        clearAble: true,
        disabled: false,
        focusOnFirstTime: true,
        label: '',
        searchLoading: false,
    }
);
let totalFocus = 0;
defineOptions({
    inheritAttrs: false,
});

const search = ref('');
const selected = ref<Option>({
    text: '',
    value: '',
});

const filterOptions = computed(() => {
    if (search.value.length === 0) return props.options;
    return props.options.filter(opt => {
        return (
            opt.text?.toLowerCase().includes(search.value?.toLowerCase()) ||
            opt.value?.toLowerCase().includes(search.value?.toLowerCase())
        );
    });
});

const open = ref(false);
const containerRef = ref(null);
onClickOutside(containerRef, () => {
    if (open.value) open.value = false;
});
const showDropDown = computed(() => {
    if (!props.showAddButton && filterOptions.value.length === 0) {
        return false;
    }
    if (filterOptions.value.length === 0 && search.value.length === 0) {
        return false;
    }
    if (
        !props.focusOnFirstTime &&
        totalFocus === 1 &&
        search.value.length > 0
    ) {
        return true;
    }
    return open.value;
});

const emits = defineEmits<{
    (e: 'addNewItem', value: any, callback?: Function): void;
    (e: 'itemSelect', value: Option): void;
    (e: 'updateSearch', value: string): void;
    (e: 'clear'): void;
}>();

watch(search, val => {
    if (val.length === 0 && selected.value.text) {
        emits('clear');
    }
    if (val !== selected.value.text && selected.value.text) {
        selected.value.text = '';
        selected.value.value = '';
    }
});

watchDebounced(
    search,
    () => {
        emits('updateSearch', search.value);
    },
    { debounce: props.debounce }
);

function onNewItem() {
    if (!props.showAddButton || loading.value) return;
    loading.value = true;
    emits('addNewItem', search.value, () => {
        search.value = '';
        loading.value = false;
        open.value = false;
    });
}

function handleSelect(option: Option) {
    search.value = option.text;
    selected.value.text = option.text;
    selected.value.value = option.value;
    open.value = false;
    emits('itemSelect', option);
}

function handleFocus() {
    totalFocus++;
    if (!props.focusOnFirstTime && totalFocus === 1) return;
    if (!open.value) open.value = true;
}

function clear() {
    search.value = '';
    selected.value.text = '';
    selected.value.value = '';
    emits('clear');
}
</script>

<template>
    <div class="w-full" ref="containerRef">
        <label v-if="props.label" class="text-sm font-bold mb-1">
            {{ props.label }}
        </label>
        <div class="relative w-full">
            <UiInput
                @focus="handleFocus"
                v-model="search"
                :placeholder="$attrs.placeholder || 'Type Here...'"
                :disabled="props.disabled"
            />
            <div
                v-if="searchLoading"
                class="animate-spin bg-transparent border-2 border-black border-r-transparent w-3 h-3 rounded-full mr-2 absolute top-[50%] right-[5px] -mt-[6px]"
            ></div>
            <template v-if="!searchLoading">
                <button
                    class="absolute top-[50%] right-[5px] -translate-y-1/2"
                    v-if="props.clearAble && search.length"
                    @click="clear"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-width="1.5"
                            d="m8.464 15.535l7.072-7.07m-7.072 0l7.072 7.07"
                        />
                    </svg>
                </button>
            </template>
            <div
                class="absolute w-full bg-white px-1 py-2 z-20 rounded-md border border-input text-black shadow-sm disabled:cursor-not-allowed disabled:opacity-50 mt-1 max-h-[300px]"
                style="overflow: auto"
                v-if="showDropDown"
            >
                <div class="">
                    <div
                        class="hover:bg-slate-200 rounded-md py-1 px-2 cursor-pointer"
                        tabindex="1"
                        v-for="opt in filterOptions"
                        @click="handleSelect(opt)"
                    >
                        {{ opt.text }}
                    </div>
                    <div
                        class="hover:bg-slate-200 rounded-md py-1 px-2 cursor-pointer"
                        v-if="filterOptions.length === 0 && props.showAddButton"
                    >
                        <UiButton
                            size="sm"
                            class="w-full"
                            @click="onNewItem"
                            :disabled="loading"
                        >
                            <div
                                v-if="loading"
                                class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                            ></div>
                            Add Item
                        </UiButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
[data-highlighted] {
    background: rgb(229, 231, 235);
}
</style>
