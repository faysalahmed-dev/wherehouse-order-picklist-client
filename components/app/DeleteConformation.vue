<script setup lang="ts">
import { handleDelete } from '~/composables/useDeleteConfirmation';
const { open, closeDialog, loading, buttonText } = useDeleteConfirmation();
</script>

<template>
    <UiAlertDialog v-model:open="open">
        <UiAlertDialogContent>
            <UiAlertDialogHeader>
                <UiAlertDialogTitle>
                    Are you absolutely sure?
                </UiAlertDialogTitle>
                <UiAlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    remove the data from server.
                </UiAlertDialogDescription>
            </UiAlertDialogHeader>
            <UiAlertDialogFooter>
                <UiAlertDialogCancel
                    @click="closeDialog"
                    :class="loading && 'opacity-50'"
                >
                    Cancel
                </UiAlertDialogCancel>
                <UiAlertDialogAction
                    @click="handleDelete"
                    :class="loading && 'opacity-50'"
                >
                    <div
                        v-if="loading"
                        class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                    ></div>
                    {{ buttonText }}
                </UiAlertDialogAction>
            </UiAlertDialogFooter>
        </UiAlertDialogContent>
    </UiAlertDialog>
</template>
