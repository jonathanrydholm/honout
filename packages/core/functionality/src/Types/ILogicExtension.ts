import { IClassDefinition } from './IClassDefinition';

export interface ILogicExtension<T, KIdentifier> {
    /** The class definition to inject. This class has to be decorated with @injectable() */
    definitions: IClassDefinition<T>[];
    /** The identifier that corresponds to the interface of the class definition */
    identifier: KIdentifier;
}
