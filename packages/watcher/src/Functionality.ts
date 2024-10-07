import { IFunctionality, ILogicExtension } from '@honout/functionality';
import { Container } from '@honout/system';
import { IWatchManager, ServiceOverrides, ServiceIdentifiers } from './Types';
import { WatchManager } from './Implementation';
import { injectable } from 'inversify';

@injectable()
export class HonoutWatcher
    implements IFunctionality<ServiceOverrides, ServiceIdentifiers>
{
    onLogicExtensions(
        extensions: ILogicExtension<ServiceOverrides, ServiceIdentifiers>[],
        container: Container
    ): void {
        extensions.forEach((extension) => {
            if (extension.identifier === ServiceIdentifiers.WATCHER) {
                extension.definitions.forEach((definition) => {
                    container
                        .bind(extension.identifier)
                        .to(definition)
                        .inSingletonScope();
                });
            }
        });
    }

    onConfigure(): void {}

    bindInternals(container: Container): void {
        container
            .bind<IWatchManager>('IWatchManager')
            .to(WatchManager)
            .inSingletonScope();
    }

    async start(container: Container): Promise<void> {
        await container.get<IWatchManager>('IWatchManager').start();
    }
}
