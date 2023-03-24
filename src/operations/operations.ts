import { MapDelegate, Matchers, MatchersMany, Result } from '../types';

export interface Matchable<T> {
    match<R>(matchers: Matchers<T, Error, R>): R;
    expect<R>(error: MapDelegate<Error, R>): T;
}

export interface MatchableAsync<T> {
    match<R>(matchers: Matchers<T, Error, R>): Promise<R>;
    expect<R>(error: MapDelegate<Error, R>): Promise<T>;
}

export interface MatchableEach<T> {
    match<R>(matchers: MatchersMany<T, Error, R>): R[];
    expect<R>(error: MapDelegate<Error[], R>): T[];
}

export interface MatchableEachAsync<T> {
    match<R>(matchers: MatchersMany<T, Error, R>): Promise<R[]>;
    expect<R>(error: MapDelegate<Error[], R>): Promise<T[]>;
}

export interface Runnable<T> {
    run(): Result<T>;
}

export interface RunnableAsync<T> {
    run(): Promise<Result<T>>;
}

export interface RunnableEach<T> {
    run(): Result<T>[];
}

export interface RunnableEachAsync<T> {
    run(): Promise<Result<T>[]>;
}

export interface TimeTrackeable<T> {
    time(key: string): Composable<T>;
}

export interface TimeTrackeableAsync<T> {
    time(key: string): ComposableAsync<T>;
}

export interface TimeTrackeableEach<T> {
    time(key: string): ComposableEach<T>;
}

export interface TimeTrackeableEachAsync<T> {
    time(key: string): ComposableEachAsync<T>;
}

export interface Retriable<T> {
    retry(times: number): Composable<T>;
}

export interface RetriableAsync<T> {
    retry(times: number): ComposableAsync<T>;
    retryTime(times: number, seconds?: number): ComposableAsync<T>;
}

export interface RetriableEach<T> {
    retry(times: number): ComposableEach<T>;
}

export interface RetriableEachAsync<T> {
    retry(times: number): ComposableEachAsync<T>;
    retryTime(times: number, seconds?: number): ComposableEachAsync<T>;
}

export interface Composable<T> extends Runnable<T>, Matchable<T>, TimeTrackeable<T>, Retriable<T> {}

export interface ComposableAsync<T>
    extends RunnableAsync<T>,
        MatchableAsync<T>,
        TimeTrackeableAsync<T>,
        RetriableAsync<T> {}

export interface ComposableEach<T> extends RunnableEach<T>, MatchableEach<T>, TimeTrackeableEach<T>, RetriableEach<T> {}

export interface ComposableEachAsync<T>
    extends RunnableEachAsync<T>,
        MatchableEachAsync<T>,
        TimeTrackeableEachAsync<T>,
        RetriableEachAsync<T> {}
