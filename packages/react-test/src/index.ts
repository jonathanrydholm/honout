import { AsyncLocalStorage } from 'node:async_hooks';
import EventEmitter from 'node:events';

const asyncLocalStorage = new AsyncLocalStorage<{
    store: Record<string, unknown>;
    emitter: EventEmitter;
}>();

export default asyncLocalStorage;
