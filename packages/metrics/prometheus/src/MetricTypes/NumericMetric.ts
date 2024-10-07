import { INumericMetric } from '@honout/metrics';
import { injectable } from '@honout/system';
import { Gauge } from 'prom-client';

@injectable()
export class NumericMetric implements INumericMetric {
    private gauge: Gauge;

    initialize(name: string, description: string): void {
        this.gauge = new Gauge({
            help: description,
            name,
        });
    }

    add(value: number): void {
        this.gauge.inc(value);
    }

    sub(value: number): void {
        this.gauge.dec(value);
    }

    set(value: number): void {
        this.gauge.set(value);
    }
}
