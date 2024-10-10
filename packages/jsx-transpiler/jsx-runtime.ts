import { jsx as originalJsx, jsxs as originalJsxs } from 'react/jsx-runtime';

export function jsx(type, props, key) {
    if (
        typeof type === 'function' &&
        type.constructor.name === 'AsyncFunction'
    ) {
        const suspendedComponent = (() => {
            let rendered;
            const promise = (type as any)(props).then(
                (result) => (rendered = result)
            );

            return {
                read() {
                    if (!rendered) {
                        throw promise;
                    }
                    return rendered;
                },
            };
        })();
        const AsyncWrapper = () => suspendedComponent.read();
        return originalJsx(AsyncWrapper, props, key);
    }

    return originalJsx(type, props, key);
}

export function jsxs(type, props, key) {
    if (
        typeof type === 'function' &&
        type.constructor.name === 'AsyncFunction'
    ) {
        const suspendedComponent = (() => {
            let rendered;
            const promise = (type as any)(props).then(
                (result) => (rendered = result)
            );

            return {
                read() {
                    if (!rendered) {
                        throw promise;
                    }
                    return rendered;
                },
            };
        })();
        const AsyncWrapper = () => suspendedComponent.read();
        return originalJsx(AsyncWrapper, props, key);
    }

    return originalJsxs(type, props, key);
}
