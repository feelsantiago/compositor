import { RetryTime } from '../../src/operations/retry-time';
import { WrappedFunctionAsync } from '../../src/operations/wrapped-function';

describe('Retry Time', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
    });

    beforeEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('Should schedule a new run if delegate fails', async () => {
        const func = new WrappedFunctionAsync(() => Promise.reject(new Error('Test')));
        const retry = new RetryTime<string>(2, func);

        retry['schedule'](2, 0, (result) => {
            expect(result.ok).toBe(false);
        });

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);

        await jest.runOnlyPendingTimersAsync();

        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);

        await jest.runOnlyPendingTimersAsync();

        expect(setTimeout).toHaveBeenCalledTimes(3);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 4000);
    });

    it('Should not schedule a new run if delegate success', async () => {
        const func = new WrappedFunctionAsync(() => Promise.resolve('success'));
        const retry = new RetryTime<string>(1, func);

        retry['schedule'](1, 0, (result) => {
            expect(result.ok).toBe(true);
        });

        await jest.runAllTimersAsync();

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);
    });

    it('Should retry operations if fail', async () => {
        const func = new WrappedFunctionAsync(() => Promise.reject(new Error('Test')));
        const retry = new RetryTime<string>(1, func);

        const operations = retry.run();
        await jest.runAllTimersAsync();
        const result = await operations;

        expect(result.ok).toBeFalsy();
        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);
    });

    it('Should not retry operations if success', async () => {
        const func = new WrappedFunctionAsync(() => Promise.resolve('success'));
        const retry = new RetryTime<string>(1, func);

        const operations = retry.run();
        await jest.runAllTimersAsync();
        const result = await operations;

        expect(result.ok).toBeTruthy();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);
    });
});
