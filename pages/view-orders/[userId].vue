<script setup lang="ts">
import type { User } from '~/api/users.api';
import { getUserById } from '~/api/users.api';

const route = useRoute('view-orders-userId');

const user = ref<User | null>(null);
const pageLoading = ref(true);

onMounted(() => {
    getUserById(route.params.userId)
        .then(res => {
            user.value = res.data;
        })
        .finally(() => {
            pageLoading.value = false;
        });
});
</script>

<template>
    <AppTablesUserOrderTable :page-loading="pageLoading" :user="user" />
</template>
