export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export interface Matchers<T, E extends Error, R> {
    ok(value: T): R;
    err(error: E): R;
}

export interface OutputTimeStream {
    time(label?: string | undefined): void;
    timeEnd(label?: string | undefined): void;
}

export type Delegate<TResult> = () => TResult;
