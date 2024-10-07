import {
    IMetricService,
    INumericMetric,
    INumericMetricFactory,
    ServiceIdentifiers,
} from '@honout/metrics';
import { inject, injectable } from '@honout/system';
import { collectDefaultMetrics } from 'prom-client';
import {
    ILogger,
    ILoggerFactory,
    ServiceIdentifiers as LoggerIdentifiers,
} from '@honout/logger';

@injectable()
export class MetricService implements IMetricService {
    private logger: ILogger;

    constructor(
        @inject(LoggerIdentifiers.LOGGER_FACTORY) loggerFactory: ILoggerFactory,
        @inject(ServiceIdentifiers.NUMERIC_METRIC_FACTORY)
        private numericFactory: INumericMetricFactory
    ) {
        this.logger = loggerFactory({ name: 'MetricService' });
    }

    start(): void {
        this.logger.info('Collecting default prometheus metrics');
        collectDefaultMetrics();
    }

    createNumericMetric(
        metricName: string,
        description: string
    ): INumericMetric {
        this.logger.info(`Creating numeric metric: ${metricName}`);
        const metric = this.numericFactory();
        metric.initialize(metricName, description);
        return metric;
    }
}
