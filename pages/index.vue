<script setup lang="ts">
import { useUserStore } from '~/store/user.store';
const auth = useUserStore();
</script>

<template>
    <AppTablesAdminOrderTable v-if="auth.user?.type === 'ADMIN'" />
    <AppTablesUserOrderTable
        v-if="auth.user?.type === 'USER'"
        :page-loading="false"
        :user="auth.user"
    />
</template>
