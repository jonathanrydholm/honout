import { IClassDefinition } from '@honout/functionality';
import { IApplication } from '../../Types';

/** Gives an application a startup priority. If application A has a higher priority
 *  than application B, then A will start first
 */
export function WithIdentifier(identifier: string) {
    return function (target: IClassDefinition<IApplication>) {
        target.prototype._honout_application_identifier = identifier;
    };
}
