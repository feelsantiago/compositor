import { Delegate, Result } from '../types';
import { Encase, EncaseAsync } from './encase';
import { Runnable, RunnableAsync } from './operations';

export class WrappedFunction<T> implements Runnable<T> {
    constructor(private readonly delegate: Delegate<T>) {}

    public run(): Result<T> {
        return Encase.run(this.delegate);
    }
}

export class WrappedFunctionAsync<T> implements RunnableAsync<T> {
    constructor(private readonly delegate: Delegate<Promise<T>>) {}

    public run(): Promise<Result<T>> {
        return EncaseAsync.run(this.delegate);
    }
}
