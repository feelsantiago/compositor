import { Retry } from "../../src/operations/retry";
import { WrappedFunction } from "../../src/operations/wrapped-function";

describe('Retry', () => {
    it('Should retry if operation fail', () => {
        const operation = jest.fn().mockImplementation(() => {
            throw new Error('Mock Error');
        });

        const retry = new Retry(3, new WrappedFunction(operation));
        const result = retry.run();

        expect(operation).toHaveBeenCalledTimes(3);
        expect(result.ok).toBeFalsy();
        expect((result as any).error.toString()).toEqual(new Error('Mock Error').toString());
    });

    it('Should stop retry when success', () => {
        const operation = jest.fn();

        const retry = new Retry(3, new WrappedFunction(operation));
        const result = retry.run();

        expect(operation).toHaveBeenCalledTimes(1);
        expect(result.ok).toBeTruthy();
    })
});
