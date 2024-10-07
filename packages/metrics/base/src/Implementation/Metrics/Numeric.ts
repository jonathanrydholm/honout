import { injectable } from '@honout/system';
import { INumericMetric } from '../../Types';

@injectable()
export class NumericMetric implements INumericMetric {
    private value: number;
    private name: string;
    private description: string;

    initialize(name: string, description: string): void {
        this.name = name;
        this.description = description;
        this.value = 0;
    }

    add(value: number): void {
        this.value += value;
    }

    sub(value: number): void {
        this.value -= value;
    }

    set(value: number): void {
        this.value = value;
    }
}
