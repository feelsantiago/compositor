import { Delegate, Result } from "../types";
import { Encase, EncaseAsync } from "./encase";
import { Runable, RunableAsync } from "./operations";

export class WrappedFunction<T> implements Runable<T> {
    constructor(private readonly delegate: Delegate<T>) { }

    public run(): Result<T> {
        return Encase.run(this.delegate);
    }
}

export class WrappedFunctionAsync<T> implements RunableAsync<T> {
    constructor(private readonly delegate: Delegate<Promise<T>>) { }

    public run(): Promise<Result<T>> {
        return EncaseAsync.run(this.delegate);
    }
}

