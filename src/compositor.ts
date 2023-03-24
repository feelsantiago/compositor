import {
    Composable,
    ComposableAsync,
    ComposableEach,
    ComposableEachAsync,
    Runnable,
    RunnableAsync,
} from './operations/operations';
import { Retry, RetryAsync } from './operations/retry';
import { RetryTime } from './operations/retry-time';
import { TimeTracker, TimeTrackerAsync } from './operations/time-tracker';
import { WrappedFunction, WrappedFunctionAsync } from './operations/wrapped-function';
import { Delegate, MapDelegate, Matchers, MatchersMany, Result } from './types';
import { UnWrap } from './utils/unwrap';

/**
 * Wraps each iterable element into a composable object
 */
export class CompositorEach<T> implements ComposableEach<T> {
    constructor(private readonly delegates: Runnable<T>[]) {}

    /**
     * Run each function and wraps into a result object
     * @returns List of result object that can be a success or a failure
     */
    public run(): Result<T>[] {
        return this.delegates.map((delegate) => delegate.run());
    }

    /**
     * Add a time log for each element in the iterable
     * Pattern {key}-{index}
     * @param key Key to log time
     * @returns Composable object
     */
    public time(key: string): ComposableEach<T> {
        const delegates = this.delegates.map((delegate, index) => new TimeTracker<T>(`${key}-${index}`, delegate));
        return new CompositorEach(delegates);
    }

    /**
     * Add retry behavior to each element in the iterable
     * @param times How many retries
     * @returns Composable object
     */
    public retry(times: number): ComposableEach<T> {
        const delegates = this.delegates.map((delegate) => new Retry<T>(times, delegate));
        return new CompositorEach(delegates);
    }

    /**
     * Rust-Like Pattern Match to safe unwrap function result
     * @param matchers Matcher for success and error |
     * Ok -> Called if at least one call is successful |
     * Err -> Called if at least one call is failure |
     * @returns Array of elements or empty array if no results successful
     */
    public match<R>(matchers: MatchersMany<T, Error, R>): R[] {
        const results = this.run();
        return UnWrap.each(results).safe(matchers);
    }

    /**
     * Unsafe unwrap results.
     * @param error If one call is failure the error is throw
     * @returns Array of elements
     */
    public expect<R>(error: MapDelegate<Error[], R>): T[] {
        const results = this.run();
        return UnWrap.each(results).unsafe(error);
    }
}

/**
 * Wraps each iterable element into a composable async object
 */
export class CompositorEachAsync<T> implements ComposableEachAsync<T> {
    constructor(private readonly delegates: RunnableAsync<T>[]) {}

    /**
     * Run each async function and wraps into a result object
     * @returns List of result object that can be a success or a failure
     */
    public async run(): Promise<Result<T>[]> {
        const results: Result<T>[] = [];

        for (let delegate of this.delegates) {
            const result = await delegate.run();
            results.push(result);
        }

        return results;
    }

    /**
     * Add a time log for each element in the iterable
     * Pattern {key}-{index}
     * @param key Key to log time
     * @returns Composable object
     */
    public time(key: string): ComposableEachAsync<T> {
        const delegates = this.delegates.map((delegate, index) => new TimeTrackerAsync<T>(`${key}-${index}`, delegate));
        return new CompositorEachAsync(delegates);
    }

    /**
     * Add retry behavior to each element in the iterable
     * @param times How many retries
     * @returns Composable object
     */
    public retry(times: number): ComposableEachAsync<T> {
        const delegates = this.delegates.map((delegate) => new RetryAsync<T>(times, delegate));
        return new CompositorEachAsync(delegates);
    }

    /**
     * Add retry time based to each element in the iterable
     * @param times How many retries
     * @param seconds How many seconds between each run
     * After each run seconds is doubled
     * @returns Composable object
     */
    public retryTime(times: number, seconds?: number | undefined): ComposableEachAsync<T> {
        const delegates = this.delegates.map((delegate) => new RetryTime<T>(times, delegate, seconds));
        return new CompositorEachAsync(delegates);
    }

    /**
     * Rust-Like Pattern Match to safe unwrap function result
     * @param matchers Matcher for success and error |
     * Ok -> Called if at least one call is successful |
     * Err -> Called if at least one call is failure |
     * @returns Array of elements or empty array if no results successful
     */
    public async match<R>(matchers: MatchersMany<T, Error, R>): Promise<R[]> {
        const results = await this.run();
        return UnWrap.each(results).safe(matchers);
    }

    /**
     * Unsafe unwrap results.
     * @param error If one call is failure the error is throw
     * @returns Array of elements
     */
    public async expect<R>(error: MapDelegate<Error[], R>): Promise<T[]> {
        const results = await this.run();
        return UnWrap.each(results).unsafe(error);
    }
}

/**
 * Wraps a function call into a composable object
 */
export class Compositor<T> implements Composable<T> {
    constructor(private readonly delegate: Runnable<T>) {}

    /**
     * Wrap a single function call into a composable object
     * @param delegate Function to wrap
     * @returns Composable object
     */
    public static do<T>(delegate: Delegate<T>): Composable<T> {
        return new Compositor(new WrappedFunction<T>(delegate));
    }

    /**
     * Wrap a single async function call into a composable object
     * @param delegate Async Function to wrap
     * @returns Composable object
     */
    public static doAsync<T>(delegate: Delegate<Promise<T>>): ComposableAsync<T> {
        return new CompositorAsync(new WrappedFunctionAsync<T>(delegate));
    }

    /**
     * Wraps each iterable element into a independent composable object
     * Each element is handle in sequence.
     * @param items Iterable
     * @param delegate Function to wrap
     * @returns Composable object
     */
    public static each<T, R>(items: T[], delegate: MapDelegate<T, R>): ComposableEach<R> {
        const delegates = items.map((item) => new WrappedFunction(() => delegate(item)));
        return new CompositorEach(delegates);
    }

    /**
     * Wraps each iterable element into a independent async composable object
     * Each element is handle in sequence.
     * @param items Iterable
     * @param delegate Async Function to wrap
     * @returns Composable object
     */
    public static eachAsync<T, R>(items: T[], delegate: MapDelegate<T, Promise<R>>): ComposableEachAsync<R> {
        const delegates = items.map((item) => new WrappedFunctionAsync(() => delegate(item)));
        return new CompositorEachAsync(delegates);
    }

    /**
     * Wraps a iterable into a composable object.
     * Works like Promise.all.
     * @param items Iterable
     * @param delegate Function to wrap
     * @returns Composable object
     */
    public static all<T, R>(items: T[], delegate: MapDelegate<T, R>): Composable<R[]> {
        const wrapped = new WrappedFunction(() => items.map((item) => delegate(item)));
        return new Compositor(wrapped);
    }

    /**
     * Wraps a iterable into a async composable object.
     * Works like Promise.all.
     * @param items Iterable
     * @param delegate Async Function to wrap
     * @returns Composable object
     */
    public static allAsync<T, R>(items: T[], delegate: MapDelegate<T, Promise<R>>): ComposableAsync<R[]> {
        const wrapped = new WrappedFunctionAsync(() => Promise.all(items.map((item) => delegate(item))));
        return new CompositorAsync(wrapped);
    }

    /**
     * Run the function and wraps into a result object
     * @returns Result object that can be a success or a failure
     */
    public run(): Result<T> {
        return this.delegate.run();
    }

    /**
     * Add a time log
     * Pattern {key}-{index}
     * @param key Key to log time
     * @returns Composable object
     */
    public time(key: string): Composable<T> {
        return new Compositor(new TimeTracker(key, this.delegate));
    }

    /**
     * Add retry behavior
     * @param times How many retries
     * @returns Composable object
     */
    public retry(times: number): Composable<T> {
        return new Compositor(new Retry(times, this.delegate));
    }

    /**
     * Rust-Like Pattern Match to safe unwrap function result
     * @param matchers Matcher for success and error |
     * Ok -> Called if successful |
     * Err -> Called if failure
     * @returns Ok callback result | Err callback result
     */
    public match<R>(matchers: Matchers<T, Error, R>): R {
        const result = this.run();
        return new UnWrap(result).safe(matchers);
    }

    /**
     * Unsafe unwrap result.
     * @param error If failure the error is throw
     * @returns Unwraped result
     */
    public expect<R>(error: MapDelegate<Error, R>): T {
        const result = this.run();
        return new UnWrap(result).unsafe(error);
    }
}

/**
 * Wraps a async function call into a composable object
 */
export class CompositorAsync<T> implements ComposableAsync<T> {
    constructor(private readonly delegate: RunnableAsync<T>) {}

    /**
     * Run the async function and wraps into a result object
     * @returns Result object that can be a success or a failure
     */
    public run(): Promise<Result<T>> {
        return this.delegate.run();
    }

    /**
     * Add a time log
     * Pattern {key}-{index}
     * @param key Key to log time
     * @returns Composable object
     */
    public time(key: string): ComposableAsync<T> {
        return new CompositorAsync(new TimeTrackerAsync(key, this.delegate));
    }

    /**
     * Add retry behavior
     * @param times How many retries
     * @returns Composable object
     */
    public retry(times: number): ComposableAsync<T> {
        return new CompositorAsync(new RetryAsync(times, this.delegate));
    }

    /**
     * Add retry time based
     * @param times How many retries
     * @param seconds How many seconds between each run
     * After each run seconds is doubled
     * @returns Composable object
     */
    public retryTime(times: number, seconds?: number): ComposableAsync<T> {
        return new CompositorAsync(new RetryTime(times, this.delegate, seconds));
    }

    /**
     * Rust-Like Pattern Match to safe unwrap function result
     * @param matchers Matcher for success and error |
     * Ok -> Called if successful |
     * Err -> Called if failure |
     * @returns Ok callback result | Err callback result
     */
    public async match<R>(matchers: Matchers<T, Error, R>): Promise<R> {
        const result = await this.run();
        return new UnWrap(result).safe(matchers);
    }

    /**
     * Unsafe unwrap result.
     * @param error If failure the error is throw
     * @returns Unwraped result
     */
    public async expect<R>(error: MapDelegate<Error, R>): Promise<T> {
        const result = await this.run();
        return new UnWrap(result).unsafe(error);
    }
}
