import { HTTP_RESPONSE_TYPE, IHttpResponse } from '../../Types/Response';

export class HttpResponse implements IHttpResponse {
    private type: HTTP_RESPONSE_TYPE;
    private headers: Record<string, number | string | readonly string[]>;

    constructor(type: HTTP_RESPONSE_TYPE) {
        this.type = type;
        this.headers = {};
    }

    getHeaders(): Record<string, number | string | readonly string[]> {
        return this.headers;
    }

    setHeader(name: string, value: number | string | readonly string[]): void {
        this.headers[name] = value;
    }

    getType(): HTTP_RESPONSE_TYPE {
        return this.type;
    }
}
