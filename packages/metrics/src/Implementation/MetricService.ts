import { inject, injectable } from '@honout/system';
import {
    IMetricService,
    INumericMetric,
    INumericMetricFactory,
    ServiceIdentifiers,
} from '../Types';
import { collectDefaultMetrics } from 'prom-client';

@injectable()
export class MetricService implements IMetricService {
    constructor(
        @inject(ServiceIdentifiers.NUMERIC_METRIC_FACTORY)
        private numericFactory: INumericMetricFactory
    ) {}

    start(): void {
        collectDefaultMetrics();
    }

    createNumericMetric(
        metricName: string,
        description: string
    ): INumericMetric {
        const metric = this.numericFactory();
        metric.initialize(metricName, description);
        return metric;
    }
}
