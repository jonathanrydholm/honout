import {
    IClassDefinition,
    IWithFunctionalityOptions,
} from '@honout/functionality';
import { IApplication } from '../../Types';

/** Adds functionality to an application */
export function WithFunctionality<TClass, TLogicIdentifier, TConfiguration>(
    options: IWithFunctionalityOptions<TClass, TLogicIdentifier, TConfiguration>
) {
    return function (target: IClassDefinition<IApplication>) {
        if (!target.prototype._honout_functionalities) {
            target.prototype._honout_functionalities = [];
        }
        target.prototype._honout_functionalities.push(options);
    };
}
