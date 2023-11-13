import { useToast } from '~/components/ui/toast';

export const useAppToast = () => {
    const { toast } = useToast();
    function errorToast(message: string) {
        toast({
            variant: 'destructive',
            description: message,
            class: 'bg-red-500 text-white',
            duration: 2500,
        });
    }
    function successToast(message: string) {
        toast({
            variant: 'default',
            description: message,
            class: 'bg-green-700 text-white py-3',
            duration: 2500,
        });
    }
    return { errorToast, successToast };
};
