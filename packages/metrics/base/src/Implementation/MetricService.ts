import { inject, injectable } from '@honout/system';
import {
    IMetricService,
    INumericMetric,
    INumericMetricFactory,
    ServiceIdentifiers,
} from '../Types';

@injectable()
export class MetricService implements IMetricService {
    constructor(
        @inject(ServiceIdentifiers.NUMERIC_METRIC_FACTORY)
        private numericFactory: INumericMetricFactory
    ) {}

    start(): void {}

    createNumericMetric(
        metricName: string,
        description: string
    ): INumericMetric {
        const metric = this.numericFactory();
        metric.initialize(metricName, description);
        return metric;
    }
}
