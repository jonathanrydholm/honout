import {
    HonoutHttpServer,
    IHttpRequestHandler,
    JsonResponse,
    Method,
    NotFoundResponse,
    Route,
    ServiceIdentifiers,
    StreamResponse,
    StringResponse,
} from '@honout/http';
import { IHttpResponse } from '@honout/http';
import {
    IApplication,
    injectable,
    System,
    WithFunctionality,
} from '@honout/system';
import { createReadStream } from 'fs';
import { join } from 'path';

@injectable()
@Method('get')
@Route('/json')
export class JsonEndpoint implements IHttpRequestHandler {
    async handle(): Promise<IHttpResponse> {
        return new JsonResponse({ user: 'abc@xyz.com' });
    }
}

@injectable()
@Method('get')
@Route('/string')
export class StringEndpoint implements IHttpRequestHandler {
    async handle(): Promise<IHttpResponse> {
        return new StringResponse('some string');
    }
}

@injectable()
@Method('get')
@Route('/not-found')
export class NotFoundEndpoint implements IHttpRequestHandler {
    async handle(): Promise<IHttpResponse> {
        return new NotFoundResponse();
    }
}

@injectable()
@Method('get')
@Route('/stream')
export class StreamEndpoint implements IHttpRequestHandler {
    async handle(): Promise<IHttpResponse> {
        const stream = createReadStream(
            join(__dirname, '../', '../', '../', 'README.md')
        );
        return new StreamResponse(stream);
    }
}

@injectable()
@WithFunctionality({
    functionality: HonoutHttpServer,
    configure: {
        port: 4500,
    },
    extend: [
        {
            identifier: ServiceIdentifiers.REQUEST_HANDLER,
            definitions: [
                JsonEndpoint,
                StringEndpoint,
                NotFoundEndpoint,
                StreamEndpoint,
            ],
        },
    ],
})
class Application implements IApplication {}

new System()
    .registerApplication(Application)
    .start()
    .then(() => {
        fetch('http://localhost:4500/stream')
            .then((res) => res.text())
            .then(console.log);
    });
