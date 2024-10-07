import { Container, Factory, injectable } from '@honout/injection';
import { IFunctionality, ILogicExtension } from '@honout/functionality';
import {
    ILogger,
    ILoggerConfiguration,
    ServiceIdentifiers,
    ServiceOverrides,
} from './Types';
import { Logger } from './Implementation';

@injectable()
export class HonoutLogger
    implements
        IFunctionality<
            ServiceOverrides,
            ServiceIdentifiers,
            ILoggerConfiguration
        >
{
    private configuration: ILoggerConfiguration = {
        name: '',
        level: 'info',
    };

    onLogicExtensions(
        extensions: ILogicExtension<ServiceOverrides, ServiceIdentifiers>[],
        container: Container
    ): void {
        extensions.forEach(({ definitions, identifier }) => {
            if (identifier === ServiceIdentifiers.LOGGER) {
                container
                    .rebind<ILogger>(ServiceIdentifiers.LOGGER)
                    .to(definitions[0]);
            }
        });
    }

    onConfigure(configuration: ILoggerConfiguration): void {
        this.configuration = configuration;
    }

    bindInternals(container: Container): void {
        container
            .bind<ILogger>(ServiceIdentifiers.LOGGER)
            .to(Logger)
            .inRequestScope();

        container
            .bind<Factory<ILogger>>('ILoggerFactory')
            .toFactory<ILogger, [ILoggerConfiguration]>((context) => {
                return (configuration: ILoggerConfiguration) => {
                    const logger = context.container.get<ILogger>(
                        ServiceIdentifiers.LOGGER
                    );
                    logger.init({
                        ...this.configuration,
                        ...configuration,
                    });
                    return logger;
                };
            });
    }

    async start(): Promise<void> {}
}
