import { inject, injectable, multiInject, optional } from '@honout/system';
import {
    ILogger,
    ILoggerFactory,
    ServiceIdentifiers as LoggerIdentifiers,
} from '@honout/logger';
import {
    IWatchableEvent,
    IWatcher,
    IWatchManager,
    ServiceIdentifiers,
} from '../Types';
import { watch } from 'chokidar';

type ChokidarEvents = 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';

@injectable()
export class WatchManager implements IWatchManager {
    private logger: ILogger;
    private eventMapper: Record<IWatchableEvent, ChokidarEvents> = {
        file_created: 'add',
        file_changed: 'change',
        file_deleted: 'unlink',
        directory_created: 'addDir',
        directory_deleted: 'unlinkDir',
    };

    constructor(
        @multiInject(ServiceIdentifiers.WATCHER)
        @optional()
        private watchers: IWatcher[],
        @inject(LoggerIdentifiers.LOGGER_FACTORY) loggerFactory: ILoggerFactory
    ) {
        this.logger = loggerFactory({ name: 'WatchManager' });
    }

    async start() {
        this.watchers.forEach((watcher) => {
            if (!watcher.watch) {
                this.logger.error(
                    'Watcher is does not contain any paths to watch'
                );
                return;
            }
            this.logger.info(`Creating watcher for ${watcher.watch()}`);

            const usePolling = watcher.usePolling
                ? watcher.usePolling()
                : undefined;

            const instance = watch(watcher.watch(), {
                ignored: watcher.ignore ? watcher.ignore() : undefined,
                persistent: watcher.persistent
                    ? watcher.persistent()
                    : undefined,
                followSymlinks: watcher.followSymlinks
                    ? watcher.followSymlinks()
                    : undefined,
                usePolling: usePolling !== undefined,
                interval: usePolling?.interval,
                binaryInterval: usePolling?.binaryInterval,
            });
            instance.on('ready', () => {
                this.logger.info(`Watching ${watcher.watch()}`);
                if (watcher.triggers) {
                    watcher.triggers().forEach((trigger) => {
                        instance.on(
                            this.eventMapper[trigger],
                            (path: string) => {
                                watcher.handle(trigger, path);
                            }
                        );
                    });
                } else {
                    this.logger.warn(
                        `No triggers defined for ${watcher.watch()}`
                    );
                }
            });
            instance.on('error', (error) => {
                this.logger.error(
                    `Received error while watching ${watcher.watch()}`,
                    error
                );
            });
        });
    }
}
