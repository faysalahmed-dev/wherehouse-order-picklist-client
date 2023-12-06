<script setup lang="ts">
import {
    getAllSubCategories,
    getAllSubCategoriesOptions,
    deleteSubCategory,
    addSubCategory,
    updateSubCategory,
} from '~/api/sub-category.api';

import type { SubCategory, SubCategoryOpt } from '~/api/sub-category.api';

import { useUserStore } from '~/store/user.store';

const user = useUserStore();
const route = useRoute('categories-category');
const toast = useAppToast();

const subcategoriesOptions = shallowRef<SubCategoryOpt[]>([]);
const subcategories = shallowRef<SubCategory[]>([]);

const pageLoading = ref(false);
const loadingSubCategories = ref(false);
const pageCount = shallowRef(1);
const totalPages = shallowRef(0);

const categoryModel = ref(false);
const savingSubCategory = ref(false);
const editItemId = ref<null | string>(null);

const inputDefaultValue = {
    title: '',
    descriptions: '',
};

const categoryInput = ref({ ...inputDefaultValue });

async function saveSubCategory() {
    let res: Promise<any>;
    savingSubCategory.value = true;
    if (editItemId.value) {
        res = updateSubCategory(editItemId.value, {
            name: categoryInput.value.title,
            description: categoryInput.value.descriptions,
        });
    } else {
        res = addSubCategory(route.params.category, {
            name: categoryInput.value.title,
            description: categoryInput.value.descriptions,
        });
    }
    res.then(() => {
        onDialogClose(false);
        categoryModel.value = false;
        toast.successToast('successfully toast created!');
        fetchCategories(true, true, 1);
    })
        .catch(err => {
            toast.errorToast((err.message as any) || 'unable to create');
        })
        .finally(() => {
            savingSubCategory.value = false;
        });
}

function onDialogClose(open: boolean) {
    if (!open) {
        categoryInput.value.descriptions = inputDefaultValue.descriptions;
        categoryInput.value.title = inputDefaultValue.title;
        editItemId.value = null;
    }
}

function addNewItem(value: string, confirmCallBack?: Function) {
    categoryModel.value = true;
    categoryInput.value.title = value;
    if (confirmCallBack) {
        confirmCallBack();
    }
}

const currentDeleteItem = ref<string | null>(null);
const { onDelete, deleteItem, open: isDialogOpen } = useDeleteConfirmation();

watch(isDialogOpen, (cur, pre) => {
    if (pre && !cur) {
        currentDeleteItem.value = null;
    }
});

onDelete('sub_category_item', async function deleteCategory() {
    if (!currentDeleteItem.value) return;
    try {
        await deleteSubCategory(currentDeleteItem.value);
        currentDeleteItem.value = null;
        toast.successToast('successfully deleted');
        fetchCategories(true, true, 1);
        getAllSubCategoriesOptions(route.params.category);
    } catch (err: any) {
        toast.errorToast(err.message);
    }
});

const containerRef = ref();

useAppInfiniteScroll(containerRef, () => {
    if (!totalPages.value) return;
    if (pageCount.value < totalPages.value) {
        pageCount.value++;
    }
});
watch(pageCount, count => {
    if (count > 1) {
        const scrollHeight = containerRef.value.scrollHeight;
        fetchCategories(false, false, count, () => {
            setTimeout(() => {
                containerRef.value.scroll({
                    behavior: 'smooth',
                    top: scrollHeight + 10,
                });
            }, 500);
        });
    }
});
watch(containerRef, container => {
    if (container) {
        container.style.height =
            window.innerHeight - container.offsetTop + 'px';
    }
});

function fetchCategories(
    clean = false,
    isPageLoading = true,
    page = 1,
    callback?: Function
) {
    if (isPageLoading) {
        pageLoading.value = true;
    } else {
        loadingSubCategories.value = true;
    }
    getAllSubCategories(route.params.category, page)
        .then((res: any) => {
            totalPages.value = res.total_pages;
            if (clean) {
                subcategories.value = res.data;
            } else {
                subcategories.value = subcategories.value.concat(res.data);
            }
            if (callback) callback();
        })
        .finally(() => {
            if (isPageLoading) {
                pageLoading.value = false;
            } else {
                loadingSubCategories.value = false;
            }
        });
}

function fetchCategoriesOptions() {
    getAllSubCategoriesOptions(route.params.category).then((res: any) => {
        subcategoriesOptions.value = res.data;
    });
}

onMounted(() => {
    fetchCategoriesOptions();
    fetchCategories(true, true);
});
</script>

<template>
    <NuxtLayout name="category">
        <div class="py-2 flex justify-between">
            <UiDialog v-model:open="categoryModel" @update:open="onDialogClose">
                <UiDialogTrigger>
                    <UiButton class="w-full mt-2">Add Sub Category</UiButton>
                </UiDialogTrigger>
                <UiDialogContent class="max-w-2xl text-gray-900 border-none">
                    <UiDialogHeader>
                        <UiDialogTitle class="text-gray-900">
                            Add Sub Category
                        </UiDialogTitle>
                        <UiDialogDescription class="flex flex-col gap-y-3">
                            <UiInput
                                v-model="categoryInput.title"
                                placeholder="Item Title"
                            />
                            <UiTextarea
                                placeholder="Item Description"
                                v-model="categoryInput.descriptions"
                                rows="5"
                            />
                        </UiDialogDescription>
                    </UiDialogHeader>

                    <UiDialogFooter>
                        <UiButton
                            @click="saveSubCategory"
                            :class="savingSubCategory && 'opacity-50'"
                        >
                            <div
                                v-if="savingSubCategory"
                                class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                            ></div>
                            Save
                        </UiButton>
                    </UiDialogFooter>
                </UiDialogContent>
            </UiDialog>
            <AppLoading v-if="loadingSubCategories" class="h-6 w-6" />
        </div>
        <template v-if="pageLoading">
            <AppLoading class="mx-auto" />
        </template>
        <template v-else>
            <div
                id="categories-container"
                ref="containerRef"
                class="overflow-auto pb-2"
                v-if="subcategories.length !== 0"
            >
                <div class="grid grid-cols-3 gap-3 py-4">
                    <AppCategory
                        v-for="subcategory in subcategories"
                        :id="subcategory.id"
                        :title="subcategory.name"
                        :descriptions="subcategory.description"
                        :slug="subcategory.value"
                        :path="`/categories/${route.params.category}/products`"
                        :showEdit="
                            user.user?.type === 'ADMIN' ||
                            subcategory.userId === user?.user?.id
                        "
                        @editItem="
                            item => {
                                editItemId = item.id;
                                categoryModel = true;
                                categoryInput.descriptions = item.descriptions;
                                categoryInput.title = item.title;
                            }
                        "
                        @deleteItem="
                            id => {
                                currentDeleteItem = id;
                                deleteItem('sub_category_item');
                            }
                        "
                    />
                </div>
            </div>
        </template>
    </NuxtLayout>
</template>
