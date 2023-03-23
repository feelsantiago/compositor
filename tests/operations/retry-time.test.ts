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

    it('Should transform factor seconds to miliseconds', () => {
        const func = new WrappedFunctionAsync(async () => 'success');
        const retry = new RetryTime<string>(3, func, 2);
        expect(retry['seconds']()).toBe(2000);
    });

    it('Should calculate next time schedule for base case', () => {
        const func = new WrappedFunctionAsync(async () => 'success');
        const retry = new RetryTime<string>(1, func);

        expect(retry['time'](1)).toBe(0);
        expect(retry['time'](0)).toBe(1000);
    });

    it('Should calculate next time schedule', () => {
        const func = new WrappedFunctionAsync(async () => 'success');
        const retry = new RetryTime<string>(3, func);

        expect(retry['time'](3)).toBe(0);
        expect(retry['time'](2)).toBe(1000);
        expect(retry['time'](1)).toBe(2000);
        expect(retry['time'](0)).toBe(3000);
    });

    it('Should schedule a new run if delegate fails', async () => {
        const func = new WrappedFunctionAsync(() => Promise.reject(new Error('Test')));
        const retry = new RetryTime<string>(1, func);

        retry['schedule'](1, (result) => {
            expect(result.ok).toBe(false);
        });

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);

        await jest.runOnlyPendingTimersAsync();

        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('Should not schedule a new run if delegate success', async () => {
        const func = new WrappedFunctionAsync(() => Promise.resolve('success'));
        const retry = new RetryTime<string>(1, func);

        retry['schedule'](1, (result) => {
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
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
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
