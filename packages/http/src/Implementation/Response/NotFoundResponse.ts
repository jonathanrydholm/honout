import { HTTP_RESPONSE_TYPE } from '../../Types/Response';
import { HttpResponse } from './HttpResponse';

export class NotFoundResponse extends HttpResponse {
    constructor() {
        super(HTTP_RESPONSE_TYPE.NOT_FOUND);
    }
}
