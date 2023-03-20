import { Compositor } from '../src/compositor';

describe('Compositor', () => {

    describe('Match', () => {
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

    describe('Expect', () => {
        it('Should throw error if operation fail', () => {
            const operation = jest.fn().mockImplementation(() => {
                throw new Error('Mock Error');
            });

            const compositor = Compositor.do(operation);
            const mock = () => compositor.expect(() => new Error('Test Error'));

            expect(mock).toThrowError('Test Error');
        });

        it('Should unsafe extract value if operation is success', () => {
            const operation = jest.fn().mockReturnValue('success');

            const compositor = Compositor.do(operation);
            const result = compositor.expect(() => new Error('Fail'));

            expect(result).toBeDefined();
            expect(result).toEqual('success');
        });
    });
});


