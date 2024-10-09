import {
    IApplication,
    injectable,
    System,
    WithFunctionality,
} from '@honout/system';
import { HonoutReactSSR } from '@honout/react-ssr';
import { join } from 'path';

@injectable()
@WithFunctionality({
    functionality: HonoutReactSSR,
    configure: {
        path: join(
            __dirname,
            '../',
            '../',
            '../',
            'packages',
            'react-test',
            'src',
            'router'
        ),
    },
})
class Application implements IApplication {}

new System()
    .registerApplication(Application)
    .start()
    .then(() => {
        console.log('Application running');
    });
