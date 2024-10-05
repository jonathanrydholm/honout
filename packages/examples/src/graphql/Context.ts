import { IGraphQLContext } from '@honout/graphql';
import { FastifyRequest, FastifyReply } from '@honout/http';
import { injectable } from '@honout/system';

@injectable()
export class GraphQLContext implements IGraphQLContext {
    async onInitialize(req: FastifyRequest, res: FastifyReply): Promise<void> {
        await new Promise<void>((resolve) => setTimeout(resolve, 200));
    }
}
