import { Delegate, Result } from "../types";

export class Encase<T> {
    constructor(private readonly delegate: Delegate<T>) { }

    public static run<T>(delegate: Delegate<T>): Result<T> {
        return new Encase(delegate).call();
    }

    public call(): Result<T> {
        try {
            return { ok: true, value: this.delegate() };
        } catch (e) {
            return { ok: false, error: e as Error };
        }
    }
}

export class EncaseAsync<T> {
    constructor(private readonly delegate: Delegate<Promise<T>>) { }

    public static run<T>(delegate: Delegate<Promise<T>>): Promise<Result<T>> {
        return new EncaseAsync(delegate).call();
    }

    public async call(): Promise<Result<T>> {
        try {
            return { ok: true, value: await this.delegate() };
        } catch (e) {
            return { ok: false, error: e as Error };
        }
    }
}
