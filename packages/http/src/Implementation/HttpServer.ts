import { inject, injectable, multiInject, optional } from '@honout/system';
import {
    IHttpRequestHandler,
    IHttpServer,
    IHttpServerConfiguration,
    ServiceIdentifiers,
} from '../Types';
import {
    ILogger,
    ILoggerFactory,
    ServiceIdentifiers as LoggerIdentifiers,
} from '@honout/logger';
import Fastify, { FastifyInstance, FastifyReply } from 'fastify';
import {
    HttpResponse,
    JsonResponse,
    StreamResponse,
    StringResponse,
} from './Response';
import { HTTP_RESPONSE_TYPE, IHttpResponse } from '../Types/Response';
import { HttpRequest } from './Request';

@injectable()
export class HttpServer implements IHttpServer {
    private server: FastifyInstance;
    private logger: ILogger;

    constructor(
        @multiInject(ServiceIdentifiers.REQUEST_HANDLER)
        @optional()
        private requestHandlers: IHttpRequestHandler[],
        @inject(LoggerIdentifiers.LOGGER_FACTORY) loggerFactory: ILoggerFactory
    ) {
        this.logger = loggerFactory({ name: 'HttpServer' });
    }

    configure(): void {
        const server = Fastify({
            logger: false,
        });

        this.requestHandlers.forEach((handler) => {
            if (handler.getMethod() === 'get') {
                server.get(handler.getPath(), async (req, res) => {
                    const response = await handler.handle(
                        new HttpRequest(req, 'get')
                    );
                    return this.handleResponse(response, res);
                });
            } else if (handler.getMethod() === 'post') {
                server.post(handler.getPath(), async (req, res) => {
                    const response = await handler.handle(
                        new HttpRequest(req, 'post')
                    );
                    return this.handleResponse(response, res);
                });
            } else if (handler.getMethod() === 'delete') {
                server.delete(handler.getPath(), async (req, res) => {
                    const response = await handler.handle(
                        new HttpRequest(req, 'delete')
                    );
                    return this.handleResponse(response, res);
                });
            } else if (handler.getMethod() === 'patch') {
                server.patch(handler.getPath(), async (req, res) => {
                    const response = await handler.handle(
                        new HttpRequest(req, 'patch')
                    );
                    return this.handleResponse(response, res);
                });
            } else if (handler.getMethod() === 'put') {
                server.put(handler.getPath(), async (req, res) => {
                    const response = await handler.handle(
                        new HttpRequest(req, 'put')
                    );
                    return this.handleResponse(response, res);
                });
            } else if (handler.getMethod() === 'all') {
                server.all(handler.getPath(), async (req, res) => {
                    const response = await handler.handle(
                        new HttpRequest(req, 'all')
                    );
                    return this.handleResponse(response, res);
                });
            }
        });
        this.server = server;
    }

    start({ port }: IHttpServerConfiguration): Promise<void> {
        this.logger.info('Starting http server');
        return new Promise<void>((resolve, reject) => {
            this.server.listen({ port }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private handleResponse(
        response: IHttpResponse,
        reply: FastifyReply
    ): unknown {
        if (response instanceof HttpResponse) {
            Object.entries(response.getHeaders()).forEach(([header, value]) => {
                reply.raw.setHeader(header, value);
            });
            switch (response.getType()) {
                case HTTP_RESPONSE_TYPE.JSON: {
                    const jsonResponse = response as JsonResponse<unknown>;
                    return jsonResponse.getValue();
                }
                case HTTP_RESPONSE_TYPE.STRING: {
                    const stringResponse = response as StringResponse;
                    return stringResponse.getValue();
                }
                case HTTP_RESPONSE_TYPE.STREAM: {
                    const streamResponse = response as StreamResponse;
                    return streamResponse.getValue();
                }
                case HTTP_RESPONSE_TYPE.NOT_FOUND: {
                    reply.status(404);
                    throw new Error('Not found');
                }
            }
        } else {
            throw new Error('Response is not of type HttpResponse');
        }
    }
}
