import {
    System,
    IApplication,
    inject,
    injectable,
    WithFunctionality,
} from '@honout/system';
import {
    ILogger,
    ILoggerFactory,
    ServiceIdentifiers as LoggerIdentifiers,
} from '@honout/logger';
import {
    HonoutWatcher,
    IWatchableEvent,
    IWatcher,
    Triggers,
    Watch,
    ServiceIdentifiers,
} from '@honout/watcher';
import { join } from 'path';

@injectable()
@Watch(join(__dirname, '../', '../', '../', 'README.md'))
@Triggers(['file_changed'])
class WatchReadMe implements IWatcher {
    private logger: ILogger;

    constructor(
        @inject(LoggerIdentifiers.LOGGER_FACTORY) loggerFactory: ILoggerFactory
    ) {
        this.logger = loggerFactory({ name: 'WatchReadMe' });
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
class Application implements IApplication {}

new System()
    .registerApplication(Application)
    .start()
    .then(() => {
        console.log('Application running');
    });
