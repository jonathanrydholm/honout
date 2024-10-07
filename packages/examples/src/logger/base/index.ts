import { IFunctionality } from '@honout/functionality';
import {
    HonoutLogger,
    ILoggerFactory,
    ServiceIdentifiers,
} from '@honout/logger';
import {
    Container,
    IApplication,
    inject,
    injectable,
    System,
    WithFunctionality,
} from '@honout/system';

@injectable()
class DummyLogic {
    @inject(ServiceIdentifiers.LOGGER_FACTORY) private factory: ILoggerFactory;

    log() {
        const logger = this.factory({ name: 'Dummy logic' });
        logger.info('Logging using basic console logger');
    }
}

@injectable()
class DummyFunctionality implements IFunctionality<null, null> {
    onLogicExtensions(): void {
        // never
    }

    onConfigure(): void | Promise<void> {
        // never
    }

    bindInternals(container: Container): void | Promise<void> {
        container
            .bind<DummyLogic>('DummyLogic')
            .to(DummyLogic)
            .inSingletonScope();
    }

    async start(container: Container): Promise<void> {
        container.get<DummyLogic>('DummyLogic').log();
    }
}

@injectable()
@WithFunctionality({
    functionality: HonoutLogger,
})
@WithFunctionality({
    functionality: DummyFunctionality,
})
class Application implements IApplication {}

new System()
    .registerApplication(Application)
    .start()
    .then(() => {
        console.log('Application running');
    });
