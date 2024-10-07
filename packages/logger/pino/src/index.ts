import { IFunctionality } from '@honout/functionality';
import { Container, injectable } from '@honout/injection';
import {
    HonoutLogger,
    ILogger,
    ILoggerConfiguration,
    ServiceIdentifiers,
    ServiceOverrides,
} from '@honout/logger';
import pino from 'pino';
import type { Logger } from 'pino';

@injectable()
class PinoLogger implements ILogger {
    private logger: Logger;

    init(configuration: ILoggerConfiguration): void {
        this.logger = pino({
            level: configuration.level,
            name: configuration.name,
        });
    }

    trace(msg: string): void {
        this.logger.trace(msg);
    }

    info(msg: string): void {
        this.logger.info(msg);
    }

    warn(msg: string): void {
        this.logger.warn(msg);
    }

    error(msg: string): void {
        this.logger.error(msg);
    }
}

export class HonoutPinoLogger
    extends HonoutLogger
    implements
        IFunctionality<
            ServiceOverrides,
            ServiceIdentifiers.LOGGER,
            ILoggerConfiguration
        >
{
    postBindInternals(container: Container): void | Promise<void> {
        container.rebind<ILogger>(ServiceIdentifiers.LOGGER).to(PinoLogger);
    }
}
