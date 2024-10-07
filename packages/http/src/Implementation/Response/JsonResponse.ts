import { HTTP_RESPONSE_TYPE } from '../../Types/Response';
import { HttpResponse } from './HttpResponse';

export class JsonResponse<TSerializable> extends HttpResponse {
    private value: TSerializable;

    constructor(value: TSerializable) {
        super(HTTP_RESPONSE_TYPE.JSON);
        this.value = value;
        this.setHeader('content-type', 'application/json');
    }

    getValue(): TSerializable {
        return this.value;
    }
}
