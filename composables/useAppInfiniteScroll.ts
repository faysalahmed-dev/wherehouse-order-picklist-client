export const useAppInfiniteScroll = (
    el: Ref<HTMLElement | null>,
    callback: Function
) => {
    const { arrivedState, y } = useScroll(el);
    // const history: number[] = [];
    watch(arrivedState, state => {
        // const hasIncluded = history.find(
        //     item => item - 5 >= y.value || y.value <= item + 5
        // );
        // && !hasIncluded
        if (state.bottom) {
            callback();
            // history.push(y.value);
            // console.log(history);
        }
    });
};
