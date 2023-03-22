import { TimeTracker, TimeTrackerAsync } from "../../src/operations/time-tracker";
import { WrappedFunction, WrappedFunctionAsync } from "../../src/operations/wrapped-function";
import { OutputTimeStream } from "../../src/types";

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

describe('TimeTracker Async', () => {
    it('Should track time between async runs', async () => {
        const mockTime: OutputTimeStream = {
            time: jest.fn(),
            timeEnd: jest.fn(),
        };

        const timeTracker = new TimeTrackerAsync(
            'key',
            new WrappedFunctionAsync(() => Promise.resolve('Test')),
            mockTime
        );

        await timeTracker.run();

        expect(mockTime.time).toHaveBeenCalledWith('key');
        expect(mockTime.timeEnd).toHaveBeenCalledWith('key');
    });
});

