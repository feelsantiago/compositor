import { Encase } from "../src/encase";

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
