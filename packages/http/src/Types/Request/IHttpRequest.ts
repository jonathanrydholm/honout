import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { IHttpMethod } from '../IHttpMethod';

export interface IHttpRequest<TQuery, TParams, TBody> {
    getParams(): TParams;
    getQuery(): TQuery;
    getBody(): TBody;
    getHeaders(): IncomingHttpHeaders;
    getMethod(): IHttpMethod;
    getUrl(): string;
    getRaw(): IncomingMessage;
}
