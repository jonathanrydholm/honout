import {
    System,
    IApplication,
    inject,
    injectable,
    WithFunctionality,
    WithStartupPriority,
    WithIdentifier,
} from '@honout/system';
import { ILogger, ILoggerFactory } from '@honout/logger';
import {
    HonoutWatcher,
    IWatchableEvent,
    IWatcher,
    Triggers,
    ServiceIdentifiers,
} from '@honout/watcher';
import { join } from 'path';

@injectable()
@Triggers(['file_created'])
class WatchReadMe implements IWatcher {
    private logger: ILogger;

    constructor(@inject('ILoggerFactory') loggerFactory: ILoggerFactory) {
        this.logger = loggerFactory({ name: `WatchReadMe ${Math.random()}` });
    }

    glob(): string {
        return join(__dirname, '../', '../', '../', 'README.md');
    }

    handle(event: IWatchableEvent, path: string): Promise<void> | void {
        this.logger.info(`${path} - ${event}`);
    }
}

@injectable()
@WithFunctionality({
    functionality: HonoutWatcher,
    extend: [
        {
            identifier: ServiceIdentifiers.WATCHER,
            definitions: [WatchReadMe],
        },
    ],
})
@WithStartupPriority(0)
@WithIdentifier('A')
class ApplicationA implements IApplication {}

@injectable()
@WithFunctionality({
    functionality: HonoutWatcher,
    extend: [
        {
            identifier: ServiceIdentifiers.WATCHER,
            definitions: [WatchReadMe],
        },
    ],
})
@WithStartupPriority(1)
@WithIdentifier('B')
class ApplicationB implements IApplication {}

new System()
    .registerApplication(ApplicationA)
    .registerApplication(ApplicationB)
    .start()
    .then(() => {
        console.log('Application running');
    });
