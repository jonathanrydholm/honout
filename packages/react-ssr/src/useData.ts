export const useData = async <TResponse>(
    id: string | number | symbol,
    action: () => Promise<TResponse>
): Promise<TResponse> => {
    let data;
    if (typeof window === 'undefined') {
        const store = require('@honout/test-react').default.getStore();
        if (store[id]) {
            return store[id];
        }
        data = await action();
        Object.assign(store, { [id]: data });
    } else {
        data = (window as any).serialized_rsc[id];
    }
    return data;
};
