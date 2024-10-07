# Honout http

## Create endpoint

```ts
import { injectable } from '@honout/system';
import { Method, Route, IHttpResponse, JsonResponse } from '@honout/http';

@injectable()
@Method('get')
@Route('/user')
export class UserEndpoint implements IHttpRequestHandler {
    async handle(): Promise<IHttpResponse> {
        return new JsonResponse({ email: 'abc@xyz.com' });
    }
}
```

## Create http server

```ts
import { injectable } from '@honout/system';
import { HonoutHttpServer, ServiceIdentifiers } from '@honout/http';

@injectable()
@WithFunctionality({
    functionality: HonoutHttpServer,
    configure: {
        port: 4500,
    },
    extend: [
        {
            identifier: ServiceIdentifiers.REQUEST_HANDLER,
            definitions: [UserEndpoint],
        },
    ],
})
class Application implements IApplication {}
```

## Decorators

### @Route

Specify the route of the endpoint

```ts
@Route('/user')
```

### @Method()

Specify the route of the endpoint

```ts
@Route('get')
```

Supported types:

-   get
-   post
-   put
-   delete
-   patch
-   all

## Response Types

-   JsonResponse
-   StringResponse
-   NotFoundResponse
-   StreamResponse
