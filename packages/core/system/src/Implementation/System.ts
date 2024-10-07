import {
    IClassDefinition,
    IHonoutFunctionality,
    IUnknownFunctionality,
    IUnknownLogicExtension,
} from '@honout/functionality';
import { v4 as uuidv4 } from 'uuid';
import { IApplication, ISystem } from '../Types';
import { Container } from '@honout/injection';
import { IInternalApplication } from '../Types/IInternalApplication';
import { HonoutLogger } from '@honout/logger';

export class System implements ISystem {
    /** System wide container. Top of the hierarchy */
    private globalScope: Container;

    constructor() {
        this.globalScope = new Container();
    }

    registerApplication(application: IClassDefinition<IApplication>): ISystem {
        this.globalScope
            .bind<IInternalApplication>('IApplication')
            .to(application as IClassDefinition<IInternalApplication>)
            .inSingletonScope();
        return this;
    }

    async start(): Promise<void> {
        const { instance } = this.bindAndReturnFunctionality(
            this.globalScope,
            HonoutLogger
        );
        await instance.bindInternals(this.globalScope);

        const applications = this.prioritizeApplications();
        for (const application of applications) {
            await this.startApplication(application);
        }
    }

    /** Starts a single application */
    private async startApplication(application: IInternalApplication) {
        const scope = this.declareApplicationScope(application);

        if (application._honout_functionalities) {
            application.onPreBindFunctionalities &&
                application.onPreBindFunctionalities(scope);
            const instances = await Promise.all(
                this.prioritizeFunctionalities(
                    application._honout_functionalities
                ).map(async ({ functionality, configure, extend }) => {
                    const { instance } = this.bindAndReturnFunctionality(
                        scope,
                        functionality
                    );
                    await this.handleFunctionalityLifecycle(
                        scope,
                        instance,
                        extend,
                        configure
                    );
                    return instance;
                })
            );
            application.onPostBindFunctionalities &&
                application.onPostBindFunctionalities(scope);

            for (const instance of instances) {
                await instance.start(scope);
            }
        }
    }

    /** Returns the scope of an application */
    private declareApplicationScope(
        application: IInternalApplication
    ): Container {
        if (application._honout_globally_accessable) {
            return this.globalScope;
        }
        const scope = new Container();
        scope.parent = this.globalScope;
        return scope;
    }

    /** Returns all applications sorted by their startup priority */
    private prioritizeApplications(): IInternalApplication[] {
        return this.globalScope
            .getAll<IInternalApplication>('IApplication')
            .sort(
                (a, b) =>
                    (b._honout_application_priority || 0) -
                    (a._honout_application_priority || 0)
            );
    }

    /** Returns all functionalities sorted by their startup priority */
    private prioritizeFunctionalities(
        functionalities: IHonoutFunctionality[]
    ): IHonoutFunctionality[] {
        return [...functionalities].sort(
            (a, b) => (b.startPriority || 0) - (a.startPriority || 0)
        );
    }

    private bindAndReturnFunctionality(
        scope: Container,
        definition: IClassDefinition<IUnknownFunctionality>
    ): { instance: IUnknownFunctionality; identifier: string } {
        const identifier =
            typeof definition === 'function' ? definition.name : uuidv4();
        scope
            .bind<IUnknownFunctionality>(identifier)
            .to(definition)
            .inSingletonScope();
        return {
            instance: scope.get<IUnknownFunctionality>(identifier),
            identifier,
        };
    }

    private async handleFunctionalityLifecycle(
        container: Container,
        functionality: IUnknownFunctionality,
        extend?: IUnknownLogicExtension[],
        configure?: unknown
    ) {
        await functionality.bindInternals(container);
        if (functionality.postBindInternals) {
            await functionality.postBindInternals(container);
        }

        if (extend) {
            functionality.onLogicExtensions(extend, container);
        }

        if (configure) {
            await functionality.onConfigure(configure, container);
        }
    }
}
