import { TimeTracker } from "../../src/operations/time-tracker";
import { WrappedFunction } from "../../src/operations/wrapped-function";
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
