import { MapDelegate, Matchers, MatchersMany, Result } from "../types";

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

export interface Runable<T> {
    run(): Result<T>;
}

export interface RunableAsync<T> {
    run(): Promise<Result<T>>;
}

export interface RunableEach<T> {
    run(): Result<T>[];
}

export interface RunableEachAsync<T> {
    run(): Promise<Result<T>[]>;
}

export interface TimeTrackeable<T> {
    time(key: string): Composible<T>;
}

export interface TimeTrackeableAsync<T> {
    time(key: string): ComposibleAsync<T>;
}

export interface TimeTrackeableEach<T> {
    time(key: string): ComposibleEach<T>;
}

export interface TimeTrackeableEachAsync<T> {
    time(key: string): ComposibleEachAsync<T>;
}

export interface Retriable<T> {
    retry(times: number): Composible<T>;
}

export interface RetriableAsync<T> {
    retry(times: number): ComposibleAsync<T>;
    retryTime(times: number, seconds?: number): ComposibleAsync<T>;
}

export interface RetriableEach<T> {
    retry(times: number): ComposibleEach<T>;
    retryTime(times: number, seconds?: number): ComposibleAsync<T>;
}

export interface RetriableEachAsync<T> {
    retry(times: number): ComposibleEachAsync<T>;
}

export interface Composible<T> extends Runable<T>, Matchable<T>, TimeTrackeable<T>, Retriable<T> {
}

export interface ComposibleAsync<T> extends RunableAsync<T>, MatchableAsync<T>, TimeTrackeableAsync<T>, RetriableAsync<T> { }

export interface ComposibleEach<T> extends RunableEach<T>, MatchableEach<T>, TimeTrackeableEach<T>, RetriableEach<T> { }

export interface ComposibleEachAsync<T> extends RunableEachAsync<T>, MatchableEachAsync<T>, TimeTrackeableEachAsync<T>, RetriableEachAsync<T> { }

