const show = ref(false);
const loading = ref(false);
const subscriberFun = new Map();
const currentDeleteItemkey = ref<string | null>(null);
const buttonText = ref('Delete');

function openDialog() {
    show.value = true;
}
function closeDialog() {
    if (loading.value) return;
    resetContext();
}

async function onDelete(key: string, callback: Function) {
    subscriberFun.set(key, callback);
}

function resetContext() {
    loading.value = false;
    currentDeleteItemkey.value = null;
    show.value = false;
    buttonText.value = 'Delete';
}

export async function handleDelete() {
    if (!subscriberFun.has(currentDeleteItemkey.value)) return;
    const callback = subscriberFun.get(currentDeleteItemkey.value);
    loading.value = true;
    if (typeof callback === 'function') {
        if (callback.constructor.name == 'AsyncFunction') {
            callback().finally(() => {
                resetContext();
            });
        } else {
            callback();
            resetContext();
        }
    }
}

function deleteItem(key: string, btnText?: string) {
    show.value = true;
    currentDeleteItemkey.value = key;
    if (btnText) {
        buttonText.value = btnText;
    }
}

export const useDeleteConfirmation = () => {
    return {
        open: readonly(show),
        loading,
        openDialog,
        closeDialog,
        onDelete,
        deleteItem,
        buttonText: readonly(buttonText),
    };
};
