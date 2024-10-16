import { Suspense } from 'react';
import { jsx as originalJsx, jsxs as originalJsxs } from 'react/jsx-runtime';

const serverSide = typeof window === 'undefined';

export function jsx(type, props, key) {
    if (typeof type === 'function') {
        if (type.constructor.name === 'AsyncFunction') {
            const suspendedComponent = (() => {
                let rendered;
                const promise = (type as any)(
                    props ? { ...props, transform: console.log } : {}
                ).then((result) => (rendered = result));

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
        } else {
            return originalJsx(type, props, key);
        }
    }

    return originalJsx(type, props, key);
}

export function jsxs(type, props, key) {
    if (typeof type === 'function') {
        if (type.constructor.name === 'AsyncFunction') {
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
            return originalJsxs(AsyncWrapper, props, key);
        } else {
            return originalJsxs(type, props, key);
        }
    }

    return originalJsxs(type, props, key);
}
