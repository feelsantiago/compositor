import { Composible, ComposibleEach, Runable, } from "./operations/operations";
import { Retry } from "./operations/retry";
import { TimeTracker } from "./operations/time-tracker";
import { WrappedFunction } from "./operations/wrapped-function";
import { Delegate, MapDelegate, Matchers, MatchersMany, Result } from "./types";
import { Results } from "./utils/results";

export class CompositorEach<T extends T[]> implements ComposibleEach<T> {
    constructor(private readonly delegates: Runable<T>[]) { }

    run(): Result<T>[] {
        return this.delegates.map((delegate) => delegate.run());
    }

    time(key: string): ComposibleEach<T> {
        const delegates = this.delegates.map((delegate) => new TimeTracker<T>(key, delegate));
        return new CompositorEach(delegates);
    }

    retry(times: number): ComposibleEach<T> {
        const delegates = this.delegates.map((delegate) => new Retry<T>(times, delegate));
        return new CompositorEach(delegates);
    }

    match<R>(matchers: MatchersMany<T, Error, R>): R[] {
        const results = this.run();
        const [success, fails] = new Results(results).group();

        const successResult = success.length ? matchers.ok(success) : undefined;

        if (fails.length) {
            matchers.err(fails);
        }

        return successResult || [];
    }

    expect<R>(error: MapDelegate<Error[], R>): T[] {
        const results = this.run();
        const [success, fails] = new Results(results).group();

        if (fails.length) {
            throw error(fails);
        }

        return success;
    }
}


export class Compositor<T> implements Composible<T> {
    constructor(private readonly delegate: Runable<T>) { }

    public static do<T>(delegate: Delegate<T>): Composible<T> {
        return new Compositor(new WrappedFunction<T>(delegate));
    }

    public static all<T, R>(items: T[], delegate: MapDelegate<T, R>): Composible<T> {
        throw new Error('');
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
