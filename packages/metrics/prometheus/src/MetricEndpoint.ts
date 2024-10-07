import {
    IHttpRequestHandler,
    Method,
    Route,
    StringResponse,
} from '@honout/http';
import { IHttpResponse } from '@honout/http';
import { injectable } from '@honout/system';
import { register } from 'prom-client';

@injectable()
@Method('get')
@Route('/metrics')
export class MetricEndpoint implements IHttpRequestHandler {
    async handle(): Promise<IHttpResponse> {
        const metrics = await register.metrics();
        return new StringResponse(metrics);
    }
}
