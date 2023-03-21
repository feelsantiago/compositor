import { MapDelegate, Matchers, Result } from "../types";

export interface Matchable<T> {
    match<R>(matchers: Matchers<T, Error, R>): R;
    expect<R>(error: MapDelegate<Error, R>): T;
}

export interface MatchableEach<T> {
    match<R>(matchers: Matchers<T, Error, R[]>): R[];
    expect<R>(error: MapDelegate<Error, R[]>): T[];
}

export interface Runable<T> {
    run(): Result<T>;
}

export interface RunableEach<T> {
    run(): Result<T>[];
}

export interface TimeTrackeable<T> {
    time(key: string): Composible<T>;
}

export interface TimeTrackeableEach<T> {
    time(key: string): ComposibleEach<T>;
}

export interface Retriable<T> {
    retry(times: number): Composible<T>;
}

export interface RetriableEach<T> {
    retry(times: number): ComposibleEach<T>;
}

export interface Composible<T> extends Runable<T>, Matchable<T>, TimeTrackeable<T>, Retriable<T> {
}

export interface ComposibleEach<T> extends RunableEach<T>, MatchableEach<T>, TimeTrackeableEach<T>, RetriableEach<T> { }
