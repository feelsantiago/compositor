import { Matchers, Result } from "../types";

export interface Matchable<T> {
    match<R>(matchers: Matchers<T, Error, R>): R;
}

export interface Runable<T> {
    run(): Result<T>;
}

export interface TimeTrackeable<T> extends Retriable<T>, Matchable<T> {
    time(key: string): Retriable<T>;
}

export interface Retriable<T> extends Matchable<T> {
    retry(times: number): Matchable<T>;
}

export interface Composible<T> extends Runable<T>, Matchable<T>, TimeTrackeable<T>, Retriable<T> {
}
