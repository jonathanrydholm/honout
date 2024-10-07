import { IFunctionality } from '@honout/functionality';
import {
    IHttpRequestHandler,
    ServiceIdentifiers as HttpServiceIdentifiers,
} from '@honout/http';
import {
    HonoutMetrics,
    IMetricService,
    INumericMetric,
    ServiceIdentifiers,
    ServiceOverrides,
} from '@honout/metrics';
import { Container } from '@honout/system';
import { MetricEndpoint } from './MetricEndpoint';
import { NumericMetric } from './MetricTypes';
import { MetricService } from './MetricService';

export class HonoutPrometheusMetrics
    extends HonoutMetrics
    implements IFunctionality<ServiceOverrides, ServiceIdentifiers>
{
    postBindInternals(container: Container): void | Promise<void> {
        container
            .rebind<IMetricService>(ServiceIdentifiers.METRIC_SERVICE)
            .to(MetricService);

        container
            .rebind<INumericMetric>(ServiceIdentifiers.NUMERIC_METRIC)
            .to(NumericMetric);

        container
            .bind<IHttpRequestHandler>(HttpServiceIdentifiers.REQUEST_HANDLER)
            .to(MetricEndpoint)
            .inSingletonScope();
    }
}
