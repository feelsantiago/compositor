import { OutputTimeStream, Result } from '../types';
import { Runnable, RunnableAsync } from './operations';

export class TimeTracker<T> implements Runnable<T> {
    constructor(
        private readonly key: string,
        private readonly delegate: Runnable<T>,
        private output: OutputTimeStream = { time: console.time, timeEnd: console.timeEnd }
    ) {}

    public run(): Result<T> {
        this.output.time(this.key);
        const result = this.delegate.run();
        this.output.timeEnd(this.key);

        return result;
    }
}

export class TimeTrackerAsync<T> implements RunnableAsync<T> {
    constructor(
        private readonly key: string,
        private readonly delegate: RunnableAsync<T>,
        private output: OutputTimeStream = { time: console.time, timeEnd: console.timeEnd }
    ) {}

    public async run(): Promise<Result<T>> {
        this.output.time(this.key);
        const result = await this.delegate.run();
        this.output.timeEnd(this.key);

        return result;
    }
}
