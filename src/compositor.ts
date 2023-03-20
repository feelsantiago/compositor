import { Encase } from "./encase";
import { Delegate, Matchers, OutputTimeStream, Result } from "./types";

export interface Matchable<T> {
    match<R>(matchers: Matchers<T, Error, R>): R;
}

export interface Runable<T> {
    run(): Result<T>;
}

export interface TimeTrackeable<T> {
    time(key: string): Matchable<T>;
}

export interface Retriable<T> {
    retry(times: number): Matchable<T>;
}

export interface Composible<T> extends Runable<T>, Matchable<T>, TimeTrackeable<T>, Retriable<T> {
}

export class WrappedFunction<T> implements Runable<T> {
    constructor(private readonly delegate: Delegate<T>) { }

    run(): Result<T> {
        return Encase.run(this.delegate);
    }
}

export class TimeTracker<T> implements Runable<T> {
    constructor(private readonly key: string, private readonly delegate: Runable<T>, private output: OutputTimeStream = { time: console.time, timeEnd: console.timeEnd }) { }

    public run(): Result<T> {
        this.output.time(this.key);
        const result = this.delegate.run();
        this.output.timeEnd(this.key);

        return result;
    }
}

export class Retry<T> implements Runable<T> {
    constructor(private readonly times: number, private readonly delegate: Runable<T>) { }

    public run(): Result<T> {
        let retry = this.times;
        let fail: Result<T> = { ok: false, error: new Error('Retry fail') };

        while (retry > 0) {
            const result = this.delegate.run();

            if (result.ok) {
                return result;
            }

            fail = result;
            retry -= 1;
        }

        return fail;
    }
}

export class Compositor<T> implements Composible<T> {
    constructor(private readonly delegate: Runable<T>) { }

    public static do<T>(delegate: Delegate<T>) {
        return new Compositor(new WrappedFunction<T>(delegate));
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
}
