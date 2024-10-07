import { IWatcher } from '../Types';
/** Watch a glob or path */
export function Watch(path: string) {
    return function (target: new (...args: any[]) => IWatcher) {
        target.prototype.watch = function () {
            return path;
        };
    };
}
