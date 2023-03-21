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

        it('Should rethrow error', () => {
            const operation = jest.fn().mockImplementation(() => {
                throw new Error('Mock Error');
            });

            const compositor = Compositor.do(operation);
            const mock = () => compositor.expect((err) => err);

            expect(mock).toThrowError('Mock Error');
        });
    });
});

describe('Compositor all', () => {
    describe('Match', () => {
        it('Should success for all', () => {
            const items = [1, 2];
            const compositor = Compositor.all(items, (item) => item);
            const results = compositor.match({
                ok: (items) => items,
                err: (err) => [],
            });

            expect(results.length).toBe(2);
            expect(results).toEqual(items);
        });

        it('Should match error if one fail', () => {
            const items = [1, 2, 3];
            const compositor = Compositor.all(items, (item) => {
                if (item === 2) {
                    throw new Error('Second error');
                }

                return item;
            });

            const results = compositor.match({
                ok: (items) => items,
                err: (err) => {
                    expect(err.toString()).toEqual(new Error('Second error').toString());
                    return [];
                }
            });

            expect(results.length).toBe(0);
        });
    });

    describe('Expect', () => {
        it('Should unsafe extract value if all success', () => {
            const items = [1, 2];
            const compositor = Compositor.all(items, (item) => item);

            const results = compositor.expect((err) => new Error('fail'));
            expect(results.length).toBe(2);
        });

        it('Should throw error if one fail', () => {
            const items = [1, 2, 3];
            const compositor = Compositor.all(items, (item) => {
                if (item === 2) {
                    throw new Error('Second error');
                }

                return item;
            });

            const mock = () => compositor.expect((err) => new Error('Fail'));
            expect(mock).toThrowError('Fail');
        });
    });
});


