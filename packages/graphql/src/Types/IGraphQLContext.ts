import { IHttpRequest } from '@honout/http';

export interface IGraphQLContext {
    onInitialize(
        request: IHttpRequest<unknown, unknown, unknown>
    ): Promise<void>;
}

export type IGraphQLContextFactory = (
    request: IHttpRequest<unknown, unknown, unknown>
) => Promise<IGraphQLContext>;
