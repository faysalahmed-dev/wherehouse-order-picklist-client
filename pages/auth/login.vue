<script setup lang="ts">
import { Form, FormField } from '~/components/ui/form';
import * as z from 'zod';
import { loginUser } from '~/api/auth';
import { useUserStore } from '~/store/user.store';
import type { APIResponse } from '~/types/response';

const loading = ref(false);

definePageMeta({
    layout: 'empty',
});

const formSchema = toTypedSchema(
    z.object({
        email: z.string().email('invalid email'),
        password: z.string().min(5).max(10),
    })
);

const form = useForm({
    validationSchema: formSchema,
});
const toast = useAppToast();
const userStore = useUserStore();

const onSubmit = form.handleSubmit(async values => {
    loading.value = true;
    try {
        const user = await loginUser<APIResponse<{ token: string; user: any }>>(
            {
                email: values.email,
                password: values.password,
            }
        );
        loading.value = false;
        userStore.value.token = user.data.token;
        userStore.value.user = user.data.user;
        toast.successToast('successfully login');
        navigateTo('/');
    } catch (err: any) {
        toast.errorToast(err.message);
        loading.value = false;
    }
});
</script>
<template>
    <div class="w-full h-full flex justify-center items-center px-6 md:px-0">
        <form class="w-96 space-y-6" @submit.prevent="onSubmit">
            <h2 class="text-lg font-bold">Login with you credentials</h2>
            <FormField v-slot="{ componentField }" name="email">
                <UiFormItem>
                    <UiFormLabel>Email</UiFormLabel>
                    <UiFormControl>
                        <UiInput
                            type="text"
                            placeholder="enter your valid email"
                            v-bind="componentField"
                        />
                    </UiFormControl>
                    <UiFormMessage />
                </UiFormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="password">
                <UiFormItem>
                    <UiFormLabel>Password</UiFormLabel>
                    <UiFormControl>
                        <UiInput
                            type="password"
                            placeholder="enter your password"
                            v-bind="componentField"
                        />
                    </UiFormControl>
                    <UiFormMessage />
                </UiFormItem>
            </FormField>
            <NuxtLink class="text-blue-500 text-sm block" to="/auth/register">
                I don't have an account
            </NuxtLink>
            <UiButton type="submit" :disabled="loading">
                <div
                    v-if="loading"
                    class="animate-spin bg-transparent border-2 border-white border-r-transparent w-3 h-3 rounded-full mr-2"
                ></div>
                Submit
            </UiButton>
        </form>
    </div>
</template>
