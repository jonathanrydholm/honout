import { Stream } from 'stream';
import { HTTP_RESPONSE_TYPE } from '../../Types/Response';
import { HttpResponse } from './HttpResponse';

export class StreamResponse extends HttpResponse {
    private value: Stream;

    constructor(value: Stream) {
        super(HTTP_RESPONSE_TYPE.STREAM);
        this.value = value;
        this.setHeader('content-type', 'application/octet-stream');
    }

    getValue(): Stream {
        return this.value;
    }
}
