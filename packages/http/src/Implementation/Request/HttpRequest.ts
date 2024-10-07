import { FastifyRequest } from 'fastify';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { IHttpMethod, IHttpRequest } from '../../Types';

export class HttpRequest<TQuery, TParams, TBody>
    implements IHttpRequest<TQuery, TParams, TBody>
{
    private req: FastifyRequest;
    private method: IHttpMethod;

    constructor(req: FastifyRequest, method: IHttpMethod) {
        this.req = req;
        this.method = method;
    }

    getRaw(): IncomingMessage {
        return this.req.raw;
    }

    getUrl(): string {
        return this.req.url;
    }

    getMethod(): IHttpMethod {
        return this.method;
    }

    getParams(): TParams {
        return this.req.params as TParams;
    }

    getQuery(): TQuery {
        return this.req.query as TQuery;
    }

    getBody(): TBody {
        return this.req.body as TBody;
    }

    getHeaders(): IncomingHttpHeaders {
        return this.req.headers;
    }
}
