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
