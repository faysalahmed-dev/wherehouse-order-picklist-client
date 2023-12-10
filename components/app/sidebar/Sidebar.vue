<script setup lang="ts">
import { useAppToast } from '~/composables/useAppToast';
import type { Option } from '~/components/app/AutoComplete.vue';
import {
    getAllCategories,
    getAllCategoriesOptions,
    deleteCategory as deleteCategoryApi,
    saveCategory,
} from '~/api/category.api';
import type { Category, CategoryOption } from '~/api/category.api';
import { useUserStore, logoutUser } from '~/store/user.store';

const toast = useAppToast();
const user = useUserStore();

const emits = defineEmits<{
    (e: 'sidebarLinkClick'): void;
}>();

const categories = shallowRef<Category[]>([]);
const categoriesOptions = ref<CategoryOption[]>([]);

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
    emits('sidebarLinkClick');
}

function fetchCategories() {
    getAllCategories().then(res => {
        categories.value = res.data;
    });
}
function fetchCategoriesOptions() {
    getAllCategoriesOptions()
        .then(res => {
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

function sidebarLinkClick() {
    emits('sidebarLinkClick');
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
    <aside class="pt-4 pb-1 bg-slate-200 flex flex-col gap-y-3 h-full">
        <UiAlertDialog v-model:open="showEditModel">
            <UiAlertDialogContent>
                <UiAlertDialogHeader>
                    <UiAlertDialogTitle> Edit Category </UiAlertDialogTitle>
                    <UiAlertDialogDescription>
                        <UiInput
                            placeholder="Type Category"
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
        <div class="flex flex-col mt-[10px]">
            <NuxtLink
                to="/"
                class="py-2 pl-3 font-medium self-start hover:text-emerald-500"
                @click="sidebarLinkClick"
            >
                Orders
            </NuxtLink>
            <!-- <NuxtLink
                to="/picklists"
                class="py-2 pl-3 font-medium self-start hover:text-emerald-500"
                v-if="user?.user?.type === 'ADMIN'"
                @click="sidebarLinkClick"
            >
                Picklists
            </NuxtLink> -->
            <NuxtLink
                to="/users"
                class="py-2 pl-3 font-medium self-start hover:text-emerald-500"
                v-if="user?.user?.type === 'ADMIN'"
                @click="sidebarLinkClick"
            >
                Users
            </NuxtLink>
        </div>
        <div class="px-2">
            <AppAutoComplete
                label="Search or Create Category:"
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
                        @click="emits('sidebarLinkClick')"
                    >
                        {{ category.name }}
                    </NuxtLink>
                    <UiDropdownMenu
                        v-if="
                            user?.user?.type === 'ADMIN' ||
                            user.user?.id === category.userId
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
