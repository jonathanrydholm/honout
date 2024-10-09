import { createElement as cr } from 'react';

export const createElement = (type, props, ...children) => {
    return cr(type, props, ...children);
};
export * from './jsx-runtime';
