import { IFunctionality, ILogicExtension } from '@honout/functionality';
import { Container } from '@honout/system';
import {
    ServiceIdentifiers,
    IHttpServer,
    IHttpServerConfiguration,
    ServiceOverrides,
} from './Types';
import { HttpServer } from './Implementation';
import { injectable } from 'inversify';

@injectable()
export class HonoutHttpServer
    implements
        IFunctionality<
            ServiceOverrides,
            ServiceIdentifiers,
            IHttpServerConfiguration
        >
{
    private configuration: IHttpServerConfiguration;

    onLogicExtensions(
        extensions: ILogicExtension<ServiceOverrides, ServiceIdentifiers>[],
        container: Container
    ): void {
        extensions.forEach((extension) => {
            if (extension.identifier === ServiceIdentifiers.REQUEST_HANDLER) {
                extension.definitions.forEach((definition) => {
                    container
                        .bind(extension.identifier)
                        .to(definition)
                        .inSingletonScope();
                });
            }
        });
    }

    onConfigure(configuration: IHttpServerConfiguration): void {
        this.configuration = {
            port: 6000,
            ...(configuration || {}),
        };
    }

    bindInternals(container: Container): void {
        container
            .bind<IHttpServer>(ServiceIdentifiers.HTTP_SERVER)
            .to(HttpServer)
            .inSingletonScope();
    }

    async start(container: Container): Promise<void> {
        container.get<IHttpServer>(ServiceIdentifiers.HTTP_SERVER).configure();
        await container
            .get<IHttpServer>(ServiceIdentifiers.HTTP_SERVER)
            .start(this.configuration);
    }
}
