# Honout Logger

A system always comes with a top level scoped logger, meaning a logger will always be accessable. You can however override it on an application level basis.

## Usage

```ts
import { injectable, IApplication } from '@honout/system';
import { HonoutLogger } from '@honout/logger';

@injectable()
@WithFunctionality({
    functionality: HonoutLogger,
    configure: {
        name: 'My logger',
        level: 'error',
    },
})
class MyApp implements IApplication {}
```
