import { HTTP_RESPONSE_TYPE } from '../../Types/Response';
import { HttpResponse } from './HttpResponse';

export class StringResponse extends HttpResponse {
    private value: string;

    constructor(value: string) {
        super(HTTP_RESPONSE_TYPE.STRING);
        this.value = value;
        this.setHeader('content-type', 'text/plain');
    }

    getValue(): string {
        return this.value;
    }
}
