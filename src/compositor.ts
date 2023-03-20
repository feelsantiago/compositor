import { Composible, Matchable, Retriable, Runable } from "./operations/operations";
import { Retry } from "./operations/retry";
import { TimeTracker } from "./operations/time-tracker";
import { WrappedFunction } from "./operations/wrapped-function";
import { Delegate, MapDelegate, Matchers, Result } from "./types";

export class Compositor<T> implements Composible<T> {
    constructor(private readonly delegate: Runable<T>) { }

    public static do<T>(delegate: Delegate<T>) {
        return new Compositor(new WrappedFunction<T>(delegate));
    }

    public run(): Result<T> {
        return this.delegate.run();
    }

    public time(key: string): Compositor<T> {
        return new Compositor(new TimeTracker(key, this.delegate));
    }

    public retry(times: number): Compositor<T> {
        return new Compositor(new Retry(times, this.delegate));
    }

    public match<R>(matchers: Matchers<T, Error, R>): R {
        const result = this.run();
        return result.ok === true ? matchers.ok(result.value) : matchers.err(result.error);
    }

    public expect<R>(error: MapDelegate<Error, R>): T {
        const result = this.run();

        if (result.ok) {
            return result.value;
        }

        throw error(result.error);
    }
}
