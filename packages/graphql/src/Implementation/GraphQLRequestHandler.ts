import {
    IHttpRequest,
    IHttpRequestHandler,
    Method,
    Route,
    StringResponse,
} from '@honout/http';
import { inject, injectable } from '@honout/system';
import { IApollo, IGraphQLContextFactory, IGraphQLIdentifiers } from '../Types';
import { HeaderMap, HTTPGraphQLRequest } from '@apollo/server';
import { parse } from 'url';

@injectable()
@Route('/graphql')
@Method('all')
export class GraphqlRequestHandler implements IHttpRequestHandler {
    constructor(
        @inject('IGraphQLApolloServer') private apollo: IApollo,
        @inject(`Factory<${IGraphQLIdentifiers.CONTEXT}>`)
        private contextFactory: IGraphQLContextFactory
    ) {}

    async handle(
        request: IHttpRequest<unknown, unknown, unknown>
    ): Promise<StringResponse> {
        const headers = new HeaderMap();
        for (const [key, value] of Object.entries(request.getHeaders())) {
            if (value !== undefined) {
                headers.set(
                    key,
                    Array.isArray(value) ? value.join(', ') : value
                );
            }
        }

        const httpGraphQLRequest: HTTPGraphQLRequest = {
            method: request.getMethod().toUpperCase(),
            headers,
            search: parse(request.getUrl()).search ?? '',
            body: request.getBody(),
        };

        const httpGraphQLResponse = await this.apollo
            .getServer()
            .executeHTTPGraphQLRequest({
                httpGraphQLRequest,
                context: () => this.contextFactory(request),
            });

        if (httpGraphQLResponse.body.kind === 'complete') {
            const response = new StringResponse(
                httpGraphQLResponse.body.string
            );
            for (const [key, value] of httpGraphQLResponse.headers) {
                response.setHeader(key, value);
            }
            return response;
        }

        let output = '';
        for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
            output = output + chunk;
            // if (typeof (res as any).flush === 'function') {
            //     (res as any).flush();
            // }
        }
        return new StringResponse(output);
    }
}
