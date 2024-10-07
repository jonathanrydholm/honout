import {
    System,
    IApplication,
    injectable,
    WithFunctionality,
} from '@honout/system';
import { HonoutHttpServer } from '@honout/http';
import { HonoutGraphql, IGraphQLIdentifiers } from '@honout/graphql';
import { AddressType, UserType } from './UserType';
import { User } from './UserResolver';
import { UserQueryInput } from './UserQueryInput';
import { GraphQLContext } from './Context';

@injectable()
@WithFunctionality({
    functionality: HonoutHttpServer,
    configure: { port: 3000 },
})
@WithFunctionality({
    functionality: HonoutGraphql,

    extend: [
        {
            identifier: IGraphQLIdentifiers.QUERY_RESOLVER,
            definitions: [User],
        },
        {
            identifier: IGraphQLIdentifiers.OUTPUT_TYPE,
            definitions: [UserType, AddressType],
        },
        {
            identifier: IGraphQLIdentifiers.INPUT_TYPE,
            definitions: [UserQueryInput],
        },
        {
            identifier: IGraphQLIdentifiers.CONTEXT,
            definitions: [GraphQLContext],
        },
    ],
})
class Application implements IApplication {}

new System()
    .registerApplication(Application)
    .start()
    .then(() => {
        console.log('Application running');
    });
