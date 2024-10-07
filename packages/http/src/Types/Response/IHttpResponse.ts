import { HTTP_RESPONSE_TYPE } from './HttpResponseType';

export interface IHttpResponse {
    getType(): HTTP_RESPONSE_TYPE;
    setHeader(name: string, value: number | string | readonly string[]): void;
    getHeaders(): Record<string, number | string | readonly string[]>;
}
