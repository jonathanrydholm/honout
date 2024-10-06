import { IFunctionality, ILogicExtension } from '@honout/functionality';
import { Container } from '@honout/system';
import {
    HttpServerIdentifiers,
    IHttpServer,
    IHttpServerConfiguration,
    IHttpServerOverridables,
} from './Types';
import { HttpServer } from './Implementation';
import { injectable } from 'inversify';

@injectable()
export class HonoutHttpServer
    implements
        IFunctionality<
            IHttpServerOverridables,
            HttpServerIdentifiers,
            IHttpServerConfiguration
        >
{
    private configuration: IHttpServerConfiguration;

    onLogicExtensions(
        extensions: ILogicExtension<
            IHttpServerOverridables,
            HttpServerIdentifiers
        >[],
        container: Container
    ): void {
        extensions.forEach((extension) => {
            if (
                extension.identifier === HttpServerIdentifiers.REQUEST_HANDLER
            ) {
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
            .bind<IHttpServer>('IHonoutHttpServer')
            .to(HttpServer)
            .inSingletonScope();
    }

    async start(container: Container): Promise<void> {
        container.get<IHttpServer>('IHonoutHttpServer').configure();
        await container
            .get<IHttpServer>('IHonoutHttpServer')
            .start(this.configuration);
    }
}
