import { Result } from "../types";

export class Results<T> {
    constructor(private readonly results: Result<T>[]) { }

    public group(): [T[], Error[]] {
        const success: T[] = [];
        const fails: Error[] = [];

        this.results.forEach((result) => {
            if (result.ok) {
                success.push(result.value);
            } else {
                fails.push(result.error);
            }
        });

        return [success, fails];
    }
}

