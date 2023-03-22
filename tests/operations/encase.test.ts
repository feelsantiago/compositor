import { Encase, EncaseAsync } from "../../src/operations/encase";

describe('Encase', () => {
    it('Should wrap a function call in a success result object', () => {
        const myFunc = () => 'success';
        const result = Encase.run(myFunc);

        expect(result).toBeDefined();
        expect(result.ok).toBeDefined();
        expect(result.ok).toBeTruthy();
    });

    it('Should wrap a function call in a fail result object', () => {
        const myFunc = () => { throw new Error('Error'); };
        const result = Encase.run(myFunc);

        expect(result).toBeDefined();
        expect(result.ok).toBeDefined();
        expect(result.ok).toBeFalsy();
    });
});

describe('Encase Async', () => {
    it('Should wrap a async function call in a success result object', async () => {
        const myFunc = jest.fn().mockImplementation(() => Promise.resolve('success'));
        const result = await EncaseAsync.run(myFunc);

        expect(myFunc).toHaveBeenCalled();
        expect(result).toBeDefined();
        expect(result.ok).toBeDefined();
        expect(result.ok).toBeTruthy();
    });

    it('Should wrap a async function call in a fail result object', async () => {
        const myFunc = jest.fn().mockImplementation(() => Promise.reject(new Error('fail')));
        const result = await EncaseAsync.run(myFunc);

        expect(myFunc).toHaveBeenCalled();
        expect(result).toBeDefined();
        expect(result.ok).toBeDefined();
        expect(result.ok).toBeFalsy();
    });
});

