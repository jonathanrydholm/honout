import {
    injectable,
    System,
    WithFunctionality,
    IApplication,
    inject,
} from '@honout/system';
import {
    HonoutMetrics,
    IMetricService,
    INumericMetric,
    ServiceIdentifiers as MetricIdentifiers,
} from '@honout/metrics';
import {
    HonoutWatcher,
    IWatchableEvent,
    IWatcher,
    Triggers,
    Watch,
    ServiceIdentifiers as WatcherIdentifiers,
} from '@honout/watcher';
import { join } from 'path';

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
    }
}

@injectable()
@WithFunctionality({
    functionality: HonoutMetrics,
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
