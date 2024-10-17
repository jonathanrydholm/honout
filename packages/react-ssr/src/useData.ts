import type EventEmitter from 'events';

export const useData = async <TResponse>(
    id: string,
    action: () => Promise<TResponse>
): Promise<TResponse> => {
    let data;
    if (typeof window === 'undefined') {
        const { store, emitter } =
            require('@honout/test-react').default.getStore() as {
                store: Record<string, unknown>;
                emitter: EventEmitter;
            };
        if (store[id]) {
            return store[id] as TResponse;
        }
        data = await action();
        emitter.emit('set_store', [id, data]);
        Object.assign(store, { [id]: data });
    } else {
        return new Promise((resolve) => {
            const observer = new MutationObserver(function (mutations) {
                for (const mutation of mutations) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes.item(i);
                        if (
                            node.nodeName === 'SCRIPT' &&
                            (node as any).id === id
                        ) {
                            observer.disconnect();
                            resolve(JSON.parse(node.textContent));
                            return;
                        }
                    }
                }
            });
            const config = { childList: true };
            observer.observe(document.body, config);
        });
    }
    return data;
};
