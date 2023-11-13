const show = ref(false);
const loading = ref(false);
const subscriberFun = new Map();
const currentDeleteItemkey = ref<string | null>(null);

function openDialog() {
    show.value = true;
}
function closeDialog() {
    if (loading.value) return;
    currentDeleteItemkey.value = null;
    if (show.value) {
        show.value = false;
    }
}

async function onDelete(key: string, callback: Function) {
    subscriberFun.set(key, callback);
}

export async function handleDelete() {
    if (!subscriberFun.has(currentDeleteItemkey.value)) return;
    const callback = subscriberFun.get(currentDeleteItemkey.value);
    loading.value = true;
    if (typeof callback === 'function') {
        if (callback.constructor.name == 'AsyncFunction') {
            callback().finally(() => {
                loading.value = false;
                currentDeleteItemkey.value = null;
                show.value = false;
            });
        } else {
            callback();
            loading.value = false;
            currentDeleteItemkey.value = null;
            show.value = false;
        }
    }
}

function deleteItem(key: string) {
    show.value = true;
    currentDeleteItemkey.value = key;
}

export const useDeleteConfirmation = () => {
    return {
        open: readonly(show),
        loading,
        openDialog,
        closeDialog,
        onDelete,
        deleteItem,
    };
};
