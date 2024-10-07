import { Container } from '@honout/injection';

export interface IApplication {
    /** Will be called right before functionalities is bound to the scope */
    onPreBindFunctionalities?(scope: Container): void;
    /** Will be called right after functionalities is bound to the scope */
    onPostBindFunctionalities?(scope: Container): void;
}
