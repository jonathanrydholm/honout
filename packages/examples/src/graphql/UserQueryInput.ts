import { IGraphQLType, IGraphQLTypeDescription } from '@honout/graphql';
import { injectable } from '@honout/system';

export interface IUserQueryInput {
    email: string;
}

@injectable()
export class UserQueryInput implements IGraphQLType<IUserQueryInput> {
    getType(): IGraphQLTypeDescription<IUserQueryInput> {
        return {
            email: 'String',
        };
    }
}
