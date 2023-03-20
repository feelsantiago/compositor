import { Compositor, Retry, TimeTracker, WrappedFunction } from '../src/compositor';
import { OutputTimeStream } from '../src/types';

describe('Compositor', () => {

    it('Should match ok', () => {
        const compositor = Compositor.do(() => 'success');
        const result = compositor.match({
            ok: (value) => value,
            err: () => 'Error',
        });

        expect(result).toEqual('success');
    });

    it('Should match error', () => {
        const compositor = Compositor.do(() => { throw new Error('Mock Error'); });
        const result = compositor.match({
            ok: (value) => value,
            err: (err) => err.toString(),
        });

        expect(result).toEqual(new Error('Mock Error').toString());
    });
});

describe('TimeTracker', () => {
    it('Should track time between runs', () => {

        const mockTime: OutputTimeStream = {
            time: jest.fn(),
            timeEnd: jest.fn(),
        };

        const timeTracker = new TimeTracker('key', new WrappedFunction(() => 'Test'), mockTime);
        timeTracker.run();

        expect(mockTime.time).toHaveBeenCalledWith('key');
        expect(mockTime.timeEnd).toHaveBeenCalledWith('key');
    });
});

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
