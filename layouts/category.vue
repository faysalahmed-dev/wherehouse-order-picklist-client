<template>
    <div class="flex-grow">
        <div
            class="py-2 md:py-4 bg-slate-200 px-6 text-gray-900 flex justify-between items-center rounded-md"
        >
            <div class="font-bold text text-green-600 flex gap-2">
                <NuxtLink :to="`/categories/${$route.params.category}`">
                    Categories
                </NuxtLink>
                <span
                    v-if="$route.path.includes('/products')"
                    class="inline-block"
                >
                    /
                </span>
                <NuxtLink
                    v-if="$route.path.includes('/products')"
                    :to="`/categories/${$route.params.category}/${$route.params.subCategory}`"
                >
                    Products
                </NuxtLink>
            </div>
            <!-- <div class="w-44">
                <AppAutoComplete
                    type="text"
                    class="w-44"
                    placeholder="Search sub categories..."
                    :options="
                        subcategoriesOptions?.map(item => ({
                            text: item.name,
                            value: item.value,
                        })) || []
                    "
                    @addNewItem="addNewItem"
                />
            </div> -->
        </div>
        <div>
            <slot />
        </div>
    </div>
</template>
