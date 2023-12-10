<script setup lang="ts">
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from '~/api/product.api';
import type { Product } from '~/api/product.api';
import {
    addOrder,
    updateOrder,
    deleteOrder,
    type Order,
} from '~/api/order.api';

import { useUserStore } from '~/store/user.store';

// ---------------- Product -----------------------
const route = useRoute('categories-category-subCategory');
const auth = useUserStore();
const showAddProductDialog = ref(false);
const loading = ref(false);
const selectedEditItem = ref<Product | null>(null);
const productNameInput = ref('');

const productsItems = ref<{ [id: string]: Product }>({});

const toast = useAppToast();

function handleEditItem(item: Product) {
    selectedEditItem.value = item;
    showAddProductDialog.value = true;
    productNameInput.value = item.name;
}

watch(showAddProductDialog, v => {
    if (!v) {
        if (selectedEditItem.value) selectedEditItem.value = null;
        if (productNameInput.value) productNameInput.value = '';
    }
});

async function createOrUpdateProduct() {
    if (!productNameInput.value.length) return;
    loading.value = true;
    try {
        if (selectedEditItem.value) {
            await updateProduct(selectedEditItem.value.id, {
                name: productNameInput.value,
            });
        } else {
            await addProduct(route.params.subCategory, {
                name: productNameInput.value,
            });
        }
        toast.successToast('successfully product added');
        showAddProductDialog.value = false;
        productNameInput.value = '';
        fetchAllProducts();
    } catch (err: any) {
        toast.errorToast(err.message);
    }
    loading.value = false;
}

async function fetchAllProducts() {
    try {
        const res = await getAllProducts(route.params.subCategory);
        productsItems.value = res.data.reduce((a, v) => {
            a[v.id] = v;
            return a;
        }, {} as { [id: string]: Product });
    } catch (err: any) {
        toast.errorToast(err.message);
    }
}

onMounted(() => {
    fetchAllProducts();
});

// ---------------- Orders -----------------------
const showAddOrderDialog = ref(false);
const selectedProductItem = ref<Product | null>(null);
const orderLoading = ref(false);
const orderAmountInput = ref(0);
const orderUnitInput = ref('');

watch(selectedProductItem, item => {
    if (item && item.orders.length) {
        orderAmountInput.value = item.orders[0].amount;
        orderUnitInput.value = item.orders[0].unit;
    }
});

const buttonDisabled = computed(() => {
    let d =
        !orderAmountInput.value || !orderUnitInput.value || orderLoading.value;
    if (selectedProductItem.value && selectedProductItem.value.orders.length) {
        const o = selectedProductItem.value.orders[0];
        return (
            d ||
            (o.unit === orderUnitInput.value &&
                o.amount === orderAmountInput.value)
        );
    }
    return d;
});
watch(showAddOrderDialog, val => {
    if (!val) {
        selectedProductItem.value = null;
        orderAmountInput.value = 0;
        orderUnitInput.value = '';
    }
});

async function makeOrder() {
    if (buttonDisabled.value || !selectedProductItem.value) return;
    try {
        orderLoading.value = true;
        if (selectedProductItem.value.orders.length) {
            await updateOrder(selectedProductItem.value.orders[0].id, {
                amount: orderAmountInput.value,
                unit_type: orderUnitInput.value,
            });
            // @ts-ignore
            productsItems.value[selectedProductItem.value.id].edges.order = {
                ...productsItems.value[selectedProductItem.value.id].orders[0],
                amount: orderAmountInput.value,
                unit: orderUnitInput.value,
            };
        } else {
            const oRes = await addOrder(selectedProductItem.value?.id, {
                amount: +orderAmountInput.value,
                unit_type: orderUnitInput.value,
            });
            productsItems.value[selectedProductItem.value?.id].orders.push(
                oRes.data
            );
        }
        showAddOrderDialog.value = false;
        toast.successToast('order added');
    } catch (err: any) {
        toast.errorToast(err.message);
    }
    orderLoading.value = false;
}

const currentDeleteItem = ref<string | null>(null);
const { onDelete, deleteItem, open: isDialogOpen } = useDeleteConfirmation();

watch(isDialogOpen, (cur, pre) => {
    if (pre && !cur) {
        currentDeleteItem.value = null;
    }
});

onDelete('product', async function () {
    if (!currentDeleteItem.value) return;
    try {
        await deleteProduct(currentDeleteItem.value);
        currentDeleteItem.value = null;
        toast.successToast('successfully deleted');
        fetchAllProducts();
    } catch (err: any) {
        toast.errorToast(err.message);
    }
});

const deletingOrder = ref(false);
async function handleDeleteOrder(orderId: string, productId: string) {
    if (!orderId) return;
    deletingOrder.value = true;
    try {
        await deleteOrder(orderId);
        productsItems.value[productId].orders = [];
        if (
            selectedProductItem.value &&
            selectedProductItem.value.orders.length
        ) {
            selectedProductItem.value.orders = [];
        }
        orderAmountInput.value = 0;
        orderUnitInput.value = '';
    } catch (err: any) {
        toast.errorToast(err.message);
    }
    deletingOrder.value = false;
}
</script>

<template>
    <NuxtLayout name="category">
        <UiDialog v-model:open="showAddProductDialog">
            <UiDialogTrigger>
                <UiButton class="w-full mt-3">Add Product</UiButton>
            </UiDialogTrigger>
            <UiDialogContent class="max-w-2xl text-gray-900 border-none">
                <UiDialogHeader>
                    <UiDialogTitle class="text-gray-900">
                        Product
                    </UiDialogTitle>
                    <UiDialogDescription class="flex flex-col gap-y-3">
                        <UiInput
                            placeholder="Enter Product name"
                            class="mt-2"
                            v-model="productNameInput"
                        />
                    </UiDialogDescription>
                </UiDialogHeader>
                <UiDialogFooter>
                    <UiButton
                        @click="createOrUpdateProduct"
                        :disabled="loading || productNameInput.length == 0"
                    >
                        <div
                            v-if="loading"
                            class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                        ></div>
                        Save
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
        <UiDialog v-model:open="showAddOrderDialog">
            <UiDialogContent class="max-w-2xl text-gray-900 border-none">
                <UiDialogHeader>
                    <UiDialogTitle class="text-gray-900">
                        Add Order to {{ selectedProductItem?.name }}
                    </UiDialogTitle>
                    <UiDialogDescription class="flex flex-col gap-y-3">
                        <AppProductItem
                            :product-name="selectedProductItem?.name!"
                            :order-id="selectedProductItem?.orders[0]?.id"
                            :product-id="selectedProductItem?.id!"
                            :has-order="!!selectedProductItem?.orders.length"
                            v-model:amount="orderAmountInput"
                            v-model:type="orderUnitInput"
                            :deletingOrder="deletingOrder"
                            @delete-item="
                                p => handleDeleteOrder(p.orderId, p.productId)
                            "
                        />
                    </UiDialogDescription>
                </UiDialogHeader>
                <UiDialogFooter>
                    <UiButton @click="makeOrder" :disabled="buttonDisabled">
                        <div
                            v-if="orderLoading"
                            class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                        ></div>
                        {{
                            selectedProductItem?.orders?.length
                                ? 'Save'
                                : 'Add Order'
                        }}
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
        <div class="grid grid-cols-3 gap-4 my-4">
            <UiCard v-for="item in productsItems" :key="item.id" class="">
                <UiCardHeader class="p-4 relative">
                    <UiCardTitle
                        :class="item.orders.length ? 'text-emerald-500' : ''"
                    >
                        {{ item.name }}
                    </UiCardTitle>
                    <div class="absolute right-1 top-1">
                        <UiDropdownMenu
                            v-if="auth.user!.id === item.userId || auth.user!.type === 'ADMIN'"
                        >
                            <UiDropdownMenuTrigger>
                                <IconThreeDot />
                            </UiDropdownMenuTrigger>
                            <UiDropdownMenuContent>
                                <UiDropdownMenuItem
                                    class="cursor-pointer"
                                    @click="handleEditItem(item)"
                                >
                                    Edit
                                </UiDropdownMenuItem>
                                <UiDropdownMenuItem
                                    @click="
                                        () => {
                                            currentDeleteItem = item.id;
                                            deleteItem('product');
                                        }
                                    "
                                    class="cursor-pointer"
                                >
                                    Delete
                                </UiDropdownMenuItem>
                            </UiDropdownMenuContent>
                        </UiDropdownMenu>
                    </div>
                </UiCardHeader>
                <UiCardFooter class="p-4">
                    <UiButton
                        size="sm"
                        @click="
                            () => {
                                showAddOrderDialog = true;
                                selectedProductItem = item;
                            }
                        "
                    >
                        {{ item.orders.length ? 'View Order' : 'Add Order' }}
                    </UiButton>
                </UiCardFooter>
            </UiCard>
        </div>
    </NuxtLayout>
</template>
