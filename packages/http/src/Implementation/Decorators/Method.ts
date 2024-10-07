import { IHttpMethod, IHttpRequestHandler } from '../../Types';

export function Method(method: IHttpMethod) {
    return function (target: new (...args: any[]) => IHttpRequestHandler) {
        target.prototype.getMethod = function () {
            return method;
        };
    };
}
