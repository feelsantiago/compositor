import { Result } from '../types';
import { RunnableAsync } from './operations';

export class RetryTime<T> implements RunnableAsync<T> {
    constructor(
        private readonly times: number,
        private readonly delegate: RunnableAsync<T>,
        private readonly seconds: number = 1
    ) {}

    public run(): Promise<Result<T>> {
        return new Promise((resolve, _) => {
            this.schedule(this.times, 0, (result) => resolve(result));
        });
    }

    private async schedule(retry: number, time: number, callback: (result: Result<T>) => void) {
        setTimeout(async () => {
            const result = await this.delegate.run();
            if (result.ok || retry == 0) {
                return callback(result);
            }

            return this.schedule(retry - 1, (time || this.seconds) * 2, callback);
        }, time * 1000);
    }
}
