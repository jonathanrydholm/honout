import { IHttpMethod } from './IHttpMethod';
import { IHttpResponse } from './Response';
import { IHttpRequest } from './Request';

export interface IHttpRequestHandler<
    TQuery = never,
    TParams = never,
    TBody = never,
> {
    handle(
        request: IHttpRequest<TQuery, TParams, TBody>
    ): IHttpResponse | Promise<IHttpResponse>;
    getPath?(): string;
    getMethod?(): IHttpMethod;
}
