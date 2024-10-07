import { IGraphQLContext } from '@honout/graphql';
import { IHttpRequest } from '@honout/http';
import { injectable } from '@honout/system';

@injectable()
export class GraphQLContext implements IGraphQLContext {
    async onInitialize(
        request: IHttpRequest<unknown, unknown, unknown>
    ): Promise<void> {
        await new Promise<void>((resolve) => setTimeout(resolve, 200));
    }
}
