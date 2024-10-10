import { Suspense } from 'react';
import { jsx as originalJsx, jsxs as originalJsxs } from 'react/jsx-runtime';

const serverSide = typeof window === 'undefined';

export function jsx(type, props, key) {
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
            if (props.fallback) {
                // Wrap with suspense if fallback prop is detected
                return originalJsx(
                    Suspense,
                    {
                        fallback: props.fallback,
                        children: originalJsx(AsyncWrapper, props, key),
                    },
                    key
                );
            }
            return originalJsx(AsyncWrapper, props, key);
        } else {
            if (serverSide) {
                return originalJsx('div', {
                    children: originalJsx(type, props, key),
                    className: type.name,
                });
            }
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
            if (props.fallback) {
                // Wrap with suspense if fallback prop is detected
                return originalJsxs(
                    Suspense,
                    {
                        fallback: props.fallback,
                        children: originalJsxs(AsyncWrapper, props, key),
                    },
                    key
                );
            }
            return originalJsxs(AsyncWrapper, props, key);
        } else {
            if (serverSide) {
                return originalJsxs('div', {
                    children: originalJsxs(type, props, key),
                    className: type.name,
                });
            }
            return originalJsxs(type, props, key);
        }
    }

    return originalJsxs(type, props, key);
}
