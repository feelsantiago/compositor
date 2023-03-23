import { Result } from "../types";
import { RunableAsync } from "./operations";

export class RetryTime<T> implements RunableAsync<T> {
    constructor(
        private readonly times: number,
        private readonly delegate: RunableAsync<T>,
        private readonly factor: number = 1,
    ) { }

    public run(): Promise<Result<T>> {
        return new Promise((resolve, _) => {
            this.schedule(this.times, (result) => resolve(result));
        });
    }

    private async schedule(retry: number, callback: (result: Result<T>) => void) {
        setTimeout(async () => {
            const result = await this.delegate.run();
            if (result.ok || retry == 0) {
                return callback(result);
            }

            return this.schedule(retry - 1, callback);
        }, this.time(retry));
    }

    private time(retry: number): number {
        return this.seconds() * (this.times - retry);
    }

    private seconds(): number {
        return this.factor * 1000;
    }
}

