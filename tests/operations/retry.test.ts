import { Retry, RetryAsync } from "../../src/operations/retry";
import { WrappedFunction, WrappedFunctionAsync } from "../../src/operations/wrapped-function";

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

describe('Retry Async', () => {
    it('Should retry if a async operation fail', async () => {
        const operation = jest.fn().mockImplementation(() => Promise.reject(new Error('Mock Error')));

        const retry = new RetryAsync(3, new WrappedFunctionAsync(operation));
        const result = await retry.run();

        expect(operation).toHaveBeenCalledTimes(3);
        expect(result.ok).toBeFalsy();
        expect((result as any).error.toString()).toEqual(new Error('Mock Error').toString());
    });

    it('Should stop retry when a async operation is success', async () => {
        const operation = jest.fn().mockImplementation(() => Promise.resolve('Success'));

        const retry = new RetryAsync(3, new WrappedFunctionAsync(operation));
        const result = await retry.run();

        expect(operation).toHaveBeenCalledTimes(1);
        expect(result.ok).toBeTruthy();
    })
});

