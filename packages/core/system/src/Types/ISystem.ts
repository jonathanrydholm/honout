import { IClassDefinition } from '@honout/functionality';
import { IApplication } from './IApplication';

export interface ISystem {
    /** Register a new application in this system */
    registerApplication(application: IClassDefinition<IApplication>): ISystem;

    /** Starts this system */
    start(): Promise<void>;
}
