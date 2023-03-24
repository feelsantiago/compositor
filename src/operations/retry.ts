import { Result } from '../types';
import { Runnable, RunnableAsync } from './operations';

export class Retry<T> implements Runnable<T> {
    constructor(private readonly times: number, private readonly delegate: Runnable<T>) {}

    public run(): Result<T> {
        let retry = this.times;
        let fail: Result<T> = { ok: false, error: new Error('Retry fail') };

        while (retry > 0) {
            const result = this.delegate.run();

            if (result.ok) {
                return result;
            }

            fail = result;
            retry -= 1;
        }

        return fail;
    }
}

export class RetryAsync<T> implements RunnableAsync<T> {
    constructor(private readonly times: number, private readonly delegate: RunnableAsync<T>) {}

    public async run(): Promise<Result<T>> {
        let retry = this.times;
        let fail: Result<T> = { ok: false, error: new Error('Retry fail') };

        while (retry > 0) {
            const result = await this.delegate.run();

            if (result.ok) {
                return result;
            }

            fail = result;
            retry -= 1;
        }

        return fail;
    }
}
