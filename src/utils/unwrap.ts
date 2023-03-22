import { MapDelegate, Matchers, MatchersMany, Result } from "../types";
import { Results } from "./results";

export class UnWrap<T> {
    constructor(private readonly result: Result<T>) { }

    public static each<T>(results: Result<T>[]): UnWrapEach<T> {
        return new UnWrapEach(results);
    }

    public safe<R>(matchers: Matchers<T, Error, R>): R {
        return this.result.ok === true ? matchers.ok(this.result.value) : matchers.err(this.result.error);
    }

    public unsafe<R>(error: MapDelegate<Error, R>): T {
        if (this.result.ok) {
            return this.result.value;
        }

        throw error(this.result.error);
    }
}

export class UnWrapEach<T> {
    constructor(private readonly results: Result<T>[]) { }

    public safe<R>(matchers: MatchersMany<T, Error, R>): R[] {
        const [success, fails] = new Results(this.results).group();
        const successResult = success.length ? matchers.ok(success) : [];

        if (fails.length) {
            matchers.err(fails);
        }

        return successResult;
    }

    public unsafe<R>(error: MapDelegate<Error[], R>): T[] {
        const [success, fails] = new Results(this.results).group();

        if (fails.length) {
            throw error(fails);
        }

        return success;
    }
}
