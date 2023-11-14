<script setup lang="ts">
import type { APIResponse } from '~/types/response';
import { useAppToast } from '~/composables/useAppToast';
import type { Option } from '~/components/app/AutoComplete.vue';
import {
    getAllCategories,
    getAllCategoriesOptions,
    deleteCategory as deleteCategoryApi,
    saveCategory,
} from '~/api/category.api';
import { useUserStore, logoutUser } from '~/store/user.store';

const toast = useAppToast();
const user = useUserStore();

interface Category {
    id: string;
    name: string;
    value: string;
    created_at: string;
    updated_at: string;
    edges: {
        user: any;
    };
}

const categories = shallowRef<APIResponse<Category[]>['data']>([]);
const categoriesOptions = ref<APIResponse<Category[]>['data']>([]);

const currentDeleteItem = ref<string | null>(null);
const { onDelete, deleteItem, open: isDialogOpen } = useDeleteConfirmation();

watch(isDialogOpen, (cur, pre) => {
    if (pre && !cur) {
        currentDeleteItem.value = null;
    }
});

onDelete('sidebar_item', async function deleteCategory() {
    if (!currentDeleteItem.value) return;
    try {
        await deleteCategoryApi(currentDeleteItem.value);
        currentDeleteItem.value = null;
        fetchCategories();
        fetchCategoriesOptions();
        toast.successToast('successfully deleted');
    } catch (err: any) {
        toast.errorToast(err.message);
    }
});
const editCategoryLoading = ref(false);
const editItem = ref({
    itemId: null as null | string,
    input: '',
});
const showEditModel = ref(false);

function openEditModel(c: Category) {
    showEditModel.value = true;
    editItem.value.input = c.name;
    editItem.value.itemId = c.id;
}

function resetEditValue() {
    editItem.value.input = '';
    editItem.value.itemId = null;
    showEditModel.value = false;
    if (editCategoryLoading.value) editCategoryLoading.value = false;
}

async function updateCategory() {
    if (!editItem.value.itemId || editItem.value.input.length < 1) return;
    editCategoryLoading.value = true;
    saveCategory({ name: editItem.value.input }, editItem.value.itemId)
        .then(() => {
            resetEditValue();
            toast.successToast('successfully updated');
            fetchCategories();
            fetchCategoriesOptions();
        })
        .catch(err => {
            toast.errorToast(err.message);
        })
        .finally(() => {
            editCategoryLoading.value = false;
        });
}

async function createCategory(value: string, confirmCallBack?: Function) {
    saveCategory({ name: value }, undefined)
        .then(() => {
            toast.successToast('successfully created');
            if (confirmCallBack) {
                confirmCallBack();
            }
            fetchCategories();
            fetchCategoriesOptions();
        })
        .catch(err => {
            toast.errorToast(err.message);
        });
}

function handleSelect(val: Option) {
    navigateTo('/categories/' + val.value);
}

function fetchCategories() {
    getAllCategories().then((res: any) => {
        categories.value = res.data;
    });
}
function fetchCategoriesOptions() {
    getAllCategoriesOptions()
        .then((res: any) => {
            if (res.data) {
                categoriesOptions.value = res.data;
            } else {
                categoriesOptions.value = [];
            }
        })
        .catch(() => {
            categoriesOptions.value = [];
        });
}

onMounted(() => {
    fetchCategoriesOptions();
    fetchCategories();

    const container = document.querySelector(
        '#categories-container'
    ) as HTMLDivElement;
    const button = document.querySelector(
        '#logout-button-container'
    ) as HTMLDivElement;
    if (container) {
        container.style.height =
            window.innerHeight -
            (container.offsetTop + button.clientHeight + 20) +
            'px';
    }
});
</script>

<template>
    <aside
        class="pt-4 pb-1 bg-slate-200 flex flex-col gap-y-3 fixed top-0 left-0 h-full"
    >
        <UiAlertDialog v-model:open="showEditModel">
            <UiAlertDialogContent>
                <UiAlertDialogHeader>
                    <UiAlertDialogTitle> Edit Category </UiAlertDialogTitle>
                    <UiAlertDialogDescription>
                        <UiInput
                            placeholder="Write here..."
                            v-model="editItem.input"
                        />
                    </UiAlertDialogDescription>
                </UiAlertDialogHeader>
                <UiAlertDialogFooter>
                    <UiAlertDialogCancel
                        @click="resetEditValue"
                        :class="editCategoryLoading && 'opacity-50'"
                    >
                        Cancel
                    </UiAlertDialogCancel>
                    <UiButton
                        @click="updateCategory"
                        :class="editCategoryLoading && 'opacity-50'"
                    >
                        <div
                            v-if="editCategoryLoading"
                            class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                        ></div>
                        Save
                    </UiButton>
                </UiAlertDialogFooter>
            </UiAlertDialogContent>
        </UiAlertDialog>
        <NuxtLink to="/" class="py-2 pl-3 font-medium self-start">
            Orders
        </NuxtLink>
        <NuxtLink
            to="/picklists"
            class="py-2 pl-3 font-medium self-start"
            v-if="user?.user?.user_type === 'ADMIN'"
        >
            Picklists
        </NuxtLink>
        <div class="px-2">
            <AppAutoComplete
                :options="
                    categoriesOptions.map(item => ({
                        text: item.name,
                        value: item.value,
                    })) || []
                "
                @addNewItem="createCategory"
                @itemSelect="handleSelect"
            />
        </div>
        <div class="flex-grow">
            <p class="text-gray-900 py-2 pl-3 font-medium">Categories:</p>
            <div
                class="flex flex-col pl-5"
                style="overflow: auto"
                id="categories-container"
            >
                <div
                    v-for="category in categories"
                    :key="category.id"
                    class="flex justify-between pr-3"
                >
                    <NuxtLink
                        class="font-medium text-green-600 inline-block py-1"
                        :to="`/categories/${category.value}`"
                    >
                        {{ category.name }}
                    </NuxtLink>
                    <UiDropdownMenu
                        v-if="
                            user?.user?.user_type === 'ADMIN' ||
                            user.user?.id === category?.edges?.user?.id
                        "
                    >
                        <UiDropdownMenuTrigger>
                            <IconThreeDot />
                        </UiDropdownMenuTrigger>
                        <UiDropdownMenuContent>
                            <UiDropdownMenuItem
                                class="cursor-pointer"
                                @click="openEditModel(category)"
                            >
                                Edit
                            </UiDropdownMenuItem>
                            <UiDropdownMenuItem
                                class="cursor-pointer"
                                @click="
                                    () => {
                                        currentDeleteItem = category.id;
                                        deleteItem('sidebar_item');
                                    }
                                "
                            >
                                Delete
                            </UiDropdownMenuItem>
                        </UiDropdownMenuContent>
                    </UiDropdownMenu>
                </div>
            </div>
        </div>
        <div
            class="text-center flex px-3 justify-between"
            id="logout-button-container"
        >
            {{ user?.user?.name }}
            <UiButton @click="logoutUser" class="rounded" size="sm">
                Logout
            </UiButton>
        </div>
    </aside>
</template>