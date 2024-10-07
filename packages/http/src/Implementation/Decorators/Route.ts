import { IHttpRequestHandler } from '../../Types';

export function Route(route: string) {
    return function (target: new (...args: any[]) => IHttpRequestHandler) {
        target.prototype.getPath = function () {
            return route;
        };
    };
}
