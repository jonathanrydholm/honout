import { Container, Factory, injectable } from '@honout/system';
import { IFunctionality, ILogicExtension } from '@honout/functionality';
import {
    ServiceIdentifiers,
    IMetricService,
    INumericMetric,
    ServiceOverrides,
} from './Types';
import { MetricService, NumericMetric } from './Implementation';

@injectable()
export class HonoutMetrics
    implements IFunctionality<ServiceOverrides, ServiceIdentifiers>
{
    onConfigure(): void {}

    bindInternals(container: Container): void {
        container
            .bind<IMetricService>(ServiceIdentifiers.METRIC_SERVICE)
            .to(MetricService)
            .inSingletonScope();

        container
            .bind<INumericMetric>(ServiceIdentifiers.NUMERIC_METRIC)
            .to(NumericMetric)
            .inRequestScope();

        container
            .bind<
                Factory<INumericMetric>
            >(ServiceIdentifiers.NUMERIC_METRIC_FACTORY)
            .toFactory<INumericMetric, []>((context) => {
                return () => {
                    return context.container.get<INumericMetric>(
                        ServiceIdentifiers.NUMERIC_METRIC
                    );
                };
            });
    }

    async start(container: Container): Promise<void> {
        container
            .get<IMetricService>(ServiceIdentifiers.METRIC_SERVICE)
            .start();
    }

    onLogicExtensions(
        extensions: ILogicExtension<ServiceOverrides, ServiceIdentifiers>[],
        container: Container
    ): void {
        extensions.forEach((extension) => {
            if (extension.identifier === ServiceIdentifiers.NUMERIC_METRIC) {
                extension.definitions.forEach((definition) => {
                    container.rebind(extension.identifier).to(definition);
                });
            } else if (
                extension.identifier === ServiceIdentifiers.METRIC_SERVICE
            ) {
                extension.definitions.forEach((definition) => {
                    container.rebind(extension.identifier).to(definition);
                });
            }
        });
    }
}
