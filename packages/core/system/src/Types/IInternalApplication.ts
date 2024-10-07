import { IHonoutFunctionality } from '@honout/functionality';
import { IApplication } from './IApplication';

// Private interface for decorated applications
export interface IInternalApplication extends IApplication {
    _honout_functionalities: IHonoutFunctionality[];
    _honout_application_priority?: number;
    _honout_application_identifier?: string;
    _honout_globally_accessable?: boolean;
}
