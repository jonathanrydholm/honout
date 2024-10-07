# Honout Metrics

## Motivation

Creates a standardized way of using metrics in applications.

## Usage

Add the following to your application

```ts
import { injectable, IApplication } from '@honout/system';
import { HonoutMetrics } from '@honout/metrics';

@injectable()
@WithFunctionality({
    functionality: HonoutMetrics,
})
class MyApp implements IApplication {}
```

Metrics will now be accessable from anywhere in your application by injection. Example

```ts
import { injectable, inject } from '@honout/system';
import { IMetricService, ServiceIdentifiers } from '@honout/metrics';

@injectable()
class SomeClass implements SomeInterface {
    constructor(
        @inject(ServiceIdentifiers.METRIC_SERVICE)
        private metrics: IMetricService
    ) {}

    someMethod() {
        const numericMetric = this.metrics.createNumericMetric(
            'counter',
            'number of iterations'
        );

        numericMetric.set(0);

        for (let i = 0; i < 10; i++) {
            numericMetric.inc(1);
        }
    }
}
```

## Overrides

### Overriding numeric metric

```ts
import { injectable, IApplication } from '@honout/system';
import {
    HonoutMetrics,
    ServiceIdentifiers,
    INumericMetric,
} from '@honout/metrics';

@injectable()
class CustomNumericMetric implements INumericMetric {
    private value: number;
    private name: string;
    private description: string;

    initialize(name: string, description: string): void {
        this.value = 0;
        this.name = name;
        this.description = description;
        setInterval(() => {
            // Publish metric somewhere
        }, 10000);
    }

    add(value: number): void {
        this.value += this.value;
    }

    sub(value: number): void {
        this.value -= this.value;
    }

    set(value: number): void {
        this.value = value;
    }
}

@injectable()
@WithFunctionality({
    functionality: HonoutMetrics,
    extend: [
        {
            identifier: ServiceIdentifiers.NUMERIC_METRIC,
            definitions: [CustomNumericMetric],
        },
    ],
})
class MyApp implements IApplication {}
```
