import { Composible, ComposibleAsync, ComposibleEach, ComposibleEachAsync, Runable, RunableAsync, } from "./operations/operations";
import { Retry, RetryAsync } from "./operations/retry";
import { TimeTracker, TimeTrackerAsync } from "./operations/time-tracker";
import { WrappedFunction, WrappedFunctionAsync } from "./operations/wrapped-function";
import { Delegate, MapDelegate, Matchers, MatchersMany, Result } from "./types";
import { Results } from "./utils/results";

export class CompositorEach<T> implements ComposibleEach<T> {
    constructor(private readonly delegates: Runable<T>[]) { }

    public run(): Result<T>[] {
        return this.delegates.map((delegate) => delegate.run());
    }

    public time(key: string): ComposibleEach<T> {
        const delegates = this.delegates.map((delegate, index) => new TimeTracker<T>(`${key}-${index}`, delegate));
        return new CompositorEach(delegates);
    }

    public retry(times: number): ComposibleEach<T> {
        const delegates = this.delegates.map((delegate) => new Retry<T>(times, delegate));
        return new CompositorEach(delegates);
    }

    public match<R>(matchers: MatchersMany<T, Error, R>): R[] {
        const results = this.run();
        const [success, fails] = new Results(results).group();

        const successResult = success.length ? matchers.ok(success) : [];

        if (fails.length) {
            matchers.err(fails);
        }

        return successResult;
    }

    public expect<R>(error: MapDelegate<Error[], R>): T[] {
        const results = this.run();
        const [success, fails] = new Results(results).group();

        if (fails.length) {
            throw error(fails);
        }

        return success;
    }
}

export class CompositorEachAsync<T> implements ComposibleEachAsync<T> {
    constructor(private readonly delegates: RunableAsync<T>[]) { }

    public async run(): Promise<Result<T>[]> {
        const results: Result<T>[] = [];

        for (let delegate of this.delegates) {
            const result = await delegate.run();
            results.push(result);
        }

        return results;
    }

    public time(key: string): ComposibleEachAsync<T> {
        const delegates = this.delegates.map((delegate, index) =>
            new TimeTrackerAsync<T>(`${key}-${index}`, delegate));
        return new CompositorEachAsync(delegates);
    }

    public retry(times: number): ComposibleEachAsync<T> {
        const delegates = this.delegates.map((delegate) => new RetryAsync<T>(times, delegate));
        return new CompositorEachAsync(delegates);
    }

    public async match<R>(matchers: MatchersMany<T, Error, R>): Promise<R[]> {
        const results = await this.run();
        const [success, fails] = new Results(results).group();

        const successResult = success.length ? matchers.ok(success) : [];

        if (fails.length) {
            matchers.err(fails);
        }

        return successResult;
    }

    public async expect<R>(error: MapDelegate<Error[], R>): Promise<T[]> {
        const results = await this.run();
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

    public static doAsync<T>(delegate: Delegate<Promise<T>>): ComposibleAsync<T> {
        return new CompositorAsync(new WrappedFunctionAsync<T>(delegate));
    }

    public static each<T, R>(items: T[], delegate: MapDelegate<T, R>): ComposibleEach<R> {
        const delegates = items.map((item) => new WrappedFunction(() => delegate(item)));
        return new CompositorEach(delegates);
    }

    public static eachAsync<T, R>(items: T[], delegate: MapDelegate<T, Promise<R>>): ComposibleEachAsync<R> {
        const delegates = items.map((item) => new WrappedFunctionAsync(() => delegate(item)));
        return new CompositorEachAsync(delegates);
    }

    public static all<T, R>(items: T[], delegate: MapDelegate<T, R>): Composible<R[]> {
        const wrapped = new WrappedFunction(() => items.map((item) => delegate(item)));
        return new Compositor(wrapped);
    }

    public static allAsync<T, R>(items: T[], delegate: MapDelegate<T, Promise<R>>): ComposibleAsync<R[]> {
        const wrapped = new WrappedFunctionAsync(() => Promise.all(items.map((item) => delegate(item))));
        return new CompositorAsync(wrapped);
    }

    public run(): Result<T> {
        return this.delegate.run();
    }

    public time(key: string): Composible<T> {
        return new Compositor(new TimeTracker(key, this.delegate));
    }

    public retry(times: number): Composible<T> {
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

export class CompositorAsync<T> implements ComposibleAsync<T> {
    constructor(private readonly delegate: RunableAsync<T>) { }

    public run(): Promise<Result<T>> {
        return this.delegate.run();
    }

    public time(key: string): ComposibleAsync<T> {
        return new CompositorAsync(new TimeTrackerAsync(key, this.delegate));
    }

    public retry(times: number): ComposibleAsync<T> {
        return new CompositorAsync(new RetryAsync(times, this.delegate));
    }

    public async match<R>(matchers: Matchers<T, Error, R>): Promise<R> {
        const result = await this.run();
        return result.ok === true ? matchers.ok(result.value) : matchers.err(result.error);
    }

    public async expect<R>(error: MapDelegate<Error, R>): Promise<T> {
        const result = await this.run();

        if (result.ok) {
            return result.value;
        }

        throw error(result.error);
    }
}

