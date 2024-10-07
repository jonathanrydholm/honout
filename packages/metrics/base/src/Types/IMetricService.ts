import { INumericMetric } from './MetricTypes';

export interface IMetricService {
    createNumericMetric(
        metricName: string,
        metricDescription: string
    ): INumericMetric;
    start(): void;
}
