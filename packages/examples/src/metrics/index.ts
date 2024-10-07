import {
    injectable,
    System,
    WithFunctionality,
    IApplication,
    inject,
} from '@honout/system';
import {
    IMetricService,
    INumericMetric,
    ServiceIdentifiers as MetricIdentifiers,
} from '@honout/metrics';
import { HonoutPrometheusMetrics } from '@honout/metrics-prometheus';
import {
    HonoutWatcher,
    IWatchableEvent,
    IWatcher,
    Triggers,
    Watch,
    ServiceIdentifiers as WatcherIdentifiers,
} from '@honout/watcher';
import { join } from 'path';
import { HonoutHttpServer } from '@honout/http';

@injectable()
@Watch(join(__dirname, '../', '../', '../', 'README.md'))
@Triggers(['file_changed'])
class WatchReadMe implements IWatcher {
    private changeMetric: INumericMetric;

    constructor(
        @inject(MetricIdentifiers.METRIC_SERVICE) metrics: IMetricService
    ) {
        this.changeMetric = metrics.createNumericMetric(
            'change_counter',
            'file_change_counter'
        );
    }

    handle(event: IWatchableEvent, path: string): Promise<void> | void {
        this.changeMetric.add(1);
        setTimeout(() => {
            fetch('http://localhost:4200/metrics')
                .then((res) => res.text())
                .then(console.log);
        }, 5000);
    }
}

@injectable()
@WithFunctionality({
    functionality: HonoutPrometheusMetrics,
})
@WithFunctionality({
    functionality: HonoutHttpServer,
    configure: {
        port: 4200,
    },
})
@WithFunctionality({
    functionality: HonoutWatcher,
    extend: [
        {
            identifier: WatcherIdentifiers.WATCHER,
            definitions: [WatchReadMe],
        },
    ],
})
class Application implements IApplication {}

new System()
    .registerApplication(Application)
    .start()
    .then(() => {
        console.log('Application running');
    });
