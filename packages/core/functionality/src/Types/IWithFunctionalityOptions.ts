import { IClassDefinition } from './IClassDefinition';
import { IFunctionality } from './IFunctionality';
import { ILogicExtension } from './ILogicExtension';

export interface IWithFunctionalityOptions<
    TClass,
    TLogicIdentifier,
    TConfiguration,
> {
    /** Configuration for functionality */
    configure?: TConfiguration;
    /** Class definition of the functionality */
    functionality: IClassDefinition<
        IFunctionality<TClass, TLogicIdentifier, TConfiguration>
    >;
    /** Extend the functionality by overriding internal injected services */
    extend?: ILogicExtension<TClass, TLogicIdentifier>[];

    /** Dictates the starting order of a functionality */
    startPriority?: number;
}
