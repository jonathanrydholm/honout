import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<Record<string, unknown>>();

export default asyncLocalStorage;
