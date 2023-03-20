import { Delegate, Result } from "../types";
import { Encase } from "./encase";
import { Runable } from "./operations";

export class WrappedFunction<T> implements Runable<T> {
    constructor(private readonly delegate: Delegate<T>) { }

    run(): Result<T> {
        return Encase.run(this.delegate);
    }
}
