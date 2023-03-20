import { OutputTimeStream, Result } from "../types";
import { Runable } from "./operations";

export class TimeTracker<T> implements Runable<T> {
    constructor(
        private readonly key: string,
        private readonly delegate: Runable<T>,
        private output: OutputTimeStream = { time: console.time, timeEnd: console.timeEnd }
    ) { }

    public run(): Result<T> {
        this.output.time(this.key);
        const result = this.delegate.run();
        this.output.timeEnd(this.key);

        return result;
    }
}
