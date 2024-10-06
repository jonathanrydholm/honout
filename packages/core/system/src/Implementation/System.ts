import { Container } from '@honout/injection';
import { v4 as uuidv4 } from 'uuid';
import { HonoutLogger, ILoggerFactory } from '@honout/logger';
import {
    IClassDefinition,
    IUnknownFunctionality,
    IUnknownLogicExtension,
} from '@honout/functionality';
import { IApplication } from '../Types';
import { IInternalApplication } from '../Types/IInternalApplication';

export class System {
    private container: Container;
    private externalBindings?: (container: Container) => void | Promise<void>;
    private externalConfigurations?: (
        container: Container
    ) => void | Promise<void>;
    private externalStarts?: (container: Container) => void | Promise<void>;

    constructor() {
        this.container = new Container();
    }

    /** Sets applications of this system */
    withApplications(applications: IClassDefinition<IApplication>[]) {
        /*
            Cast applications to internal applications which contain metadata through decorators
        */
        const internalApplications =
            applications as IClassDefinition<IInternalApplication>[];
        internalApplications.forEach((application) => {
            this.container
                .bind<IInternalApplication>('IApplication')
                .to(application)
                .inSingletonScope();
        });
        return this;
    }

    onConfigureExternals(
        callback: (container: Container) => void | Promise<void>
    ): void {
        this.externalConfigurations = callback;
    }

    onBindExternals(callback: (container: Container) => void | Promise<void>) {
        this.externalBindings = callback;
    }

    onStartExternals(callback: (container: Container) => void | Promise<void>) {
        this.externalStarts = callback;
    }

    /** Starts the system */
    async start() {
        const logger = new HonoutLogger();
        logger.bindInternals(this.container);
        const systemLogger = this.container.get<ILoggerFactory>(
            'ILoggerFactory'
        )({ name: 'System' });
        const applications = this.getPrioritizedApplications();
        const startableInstances: (() => Promise<void>)[] = [];
        for (const application of applications) {
            systemLogger.info(
                `Starting application ${application._honout_application_identifier}`
            );
            const container = new Container();
            container.parent = this.container;
            /*
                May be undefined in case of no functionality decorators
            */
            if (application._honout_functionalities) {
                for (const honoutFunctionality of application._honout_functionalities) {
                    const { functionality, configure, extend } =
                        honoutFunctionality;

                    const { instance, identifier } =
                        this.bindAndReturnFunctionality(
                            container,
                            functionality
                        );

                    systemLogger.trace(
                        `Bound functionality ${identifier} to ${application._honout_application_identifier || 'Unknown application'}`
                    );

                    await this.handleFunctionalityLifecycle(
                        container,
                        instance,
                        extend,
                        configure
                    );

                    startableInstances.push(() => instance.start(container));
                }
            }

            if (this.externalBindings) {
                await this.externalBindings(this.container);
            }
            if (this.externalConfigurations) {
                await this.externalConfigurations(this.container);
            }

            for (const instance of startableInstances) {
                await instance();
            }
            if (this.externalStarts) {
                await this.externalStarts(this.container);
            }
        }
    }

    private getPrioritizedApplications(): IInternalApplication[] {
        return this.container
            .getAll<IInternalApplication>('IApplication')
            .sort(
                (a, b) =>
                    (b._honout_application_priority || 0) -
                    (a._honout_application_priority || 0)
            );
    }

    private bindAndReturnFunctionality(
        container: Container,
        definition: IClassDefinition<IUnknownFunctionality>
    ): { instance: IUnknownFunctionality; identifier: string } {
        const identifier =
            typeof definition === 'function' ? definition.name : uuidv4();
        container
            .bind<IUnknownFunctionality>(identifier)
            .to(definition)
            .inSingletonScope();
        return {
            instance: container.get<IUnknownFunctionality>(identifier),
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
