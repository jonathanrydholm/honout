export interface INumericMetric {
    initialize(name: string, description: string): void;
    add(value: number): void;
    sub(value: number): void;
    set(value: number): void;
}
