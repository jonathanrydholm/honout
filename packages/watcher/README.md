# Honout Watcher

## Simple watcher

The following watcher will listen for changes on any typescript file that exists inside a src folder.

```ts
import { join } from 'path';
import { injectable } from '@honout/system';
import { IWatchableEvent, IWatcher, Triggers, Watch } from '@honout/watcher';

@injectable()
@Watch('src/**/*.ts')
@Triggers(['file_changed'])
class WatchTSFiles implements IWatcher {
    handle(event: IWatchableEvent, path: string): Promise<void> | void {
        this.logger.info(`${path} - ${event}`);
    }
}
```

## Register the watcher

```ts
import { WithFunctionality } from '@honout/system'
import {
    HonoutWatcher,
    IWatchableEvent,
    WatcherIdentifiers,
} from '@honout/watcher'

@WithFunctionality({
    functionality: HonoutWatcher,
    extend: [
        {
            identifier: WatcherIdentifiers.WATCHER,
            definitions: [WatchTSFiles],
        },
    ],
})
```

## Decorators

### @Watch

Specifies a path or a glob pattern to watch.

```ts
import { Watch } from '@honout/watcher';

@Watch('some/path/to/file')
```

### @Triggers

The types of events to listen for

```ts
import { Triggers } from '@honout/watcher';

@Triggers(['file_created', 'file_changed', 'file_deleted'])
```

-   'file_created' - When a file is created
-   'file_changed' - When a new file or directory is changed
-   'file_deleted' - When a file is deleted
-   'directory_created' - When a directory is created
-   'directory_deleted' - When a directory is deleted

### @FollowSymlinks

Weather or not to follow symlinks

```ts
import { FollowSymlinks } from '@honout/watcher';

@FollowSymlinks(true)
@FollowSymlinks(() => process.env.NODE_ENV === 'development')
```

### @Persistent

Weather or not the main process should continue to run while this watcher is active

```ts
import { Persistent } from '@honout/watcher';

@Persistent(true)
```

### @UsePolling

Weather or not to use polling instead of native file watchers. This is typically needed when watching files over a network.

```ts
import { UsePolling } from '@honout/watcher';

@UsePolling({ interval: 100, binaryInterval: 300 })
```
