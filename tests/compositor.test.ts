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

describe('Compositor Async', () => {
    describe('Match', () => {
        it('Should match ok', async () => {
            const compositor = Compositor.doAsync(() => Promise.resolve('success'));
            const result = await compositor.match({
                ok: (value) => value,
                err: () => 'Error',
            });

            expect(result).toEqual('success');
        });

        it('Should match error', async () => {
            const compositor = Compositor.doAsync(() => Promise.reject(new Error('Mock Error')));
            const result = await compositor.match({
                ok: (value) => value,
                err: (err) => err.toString(),
            });

            expect(result).toEqual(new Error('Mock Error').toString());
        });
    });

    describe('Expect', () => {
        it('Should throw error if operation fail', async () => {
            const operation = jest.fn().mockImplementation(() => Promise.reject('Test Error'));

            const compositor = Compositor.doAsync(operation);
            const mock = async () => compositor.expect(() => new Error('Test Error'));

            await expect(mock).rejects.toThrowError('Test Error');
        });

        it('Should unsafe extract value if operation is success', async () => {
            const operation = jest.fn().mockImplementation(() => Promise.resolve('success'))

            const compositor = Compositor.doAsync(operation);
            const result = await compositor.expect(() => new Error('Fail'));

            expect(result).toBeDefined();
            expect(result).toEqual('success');
        });

        it('Should rethrow error', async () => {
            const operation = jest.fn().mockImplementation(() => Promise.reject(new Error('Mock Error')));

            const compositor = Compositor.doAsync(operation);
            const mock = async () => compositor.expect((err) => err);

            await expect(mock).rejects.toThrowError('Mock Error');
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

describe('Compositor all async', () => {
    describe('Match', () => {
        it('Should success for all', async () => {
            const items = [1, 2];
            const compositor = Compositor.allAsync(items, (item) => Promise.resolve(item));
            const results = await compositor.match({
                ok: (items) => items,
                err: (err) => [],
            });

            expect(results.length).toBe(2);
            expect(results).toEqual(items);
        });

        it('Should match error if one fail', async () => {
            const items = [1, 2, 3];
            const compositor = Compositor.allAsync(items, (item) => {
                if (item === 2) {
                    return Promise.reject(new Error('Second error'));
                }

                return Promise.resolve(item);
            });

            const results = await compositor.match({
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
        it('Should unsafe extract value if all success', async () => {
            const items = [1, 2];
            const compositor = Compositor.allAsync(items, (item) => Promise.resolve(item));

            const results = await compositor.expect((err) => new Error('fail'));
            expect(results.length).toBe(2);
        });

        it('Should throw error if one fail', async () => {
            const items = [1, 2, 3];
            const compositor = Compositor.allAsync(items, (item) => {
                if (item === 2) {
                    return Promise.reject(new Error('Second error'));
                }

                return Promise.resolve(item);
            });

            const mock = async () => compositor.expect((err) => new Error('Fail'));
            await expect(mock).rejects.toThrowError('Fail');
        });
    });
});

describe('Compositor each', () => {
    describe('Match', () => {
        it('Should match success', () => {
            const func = jest.fn().mockReturnValue(1);
            const compositor = Compositor.each([1, 2], (item) => func());

            const result = compositor.match({
                ok: (values) => values,
                err: (err) => {
                    fail();
                }
            });

            expect(func).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(2);
        });

        it('Should match error and result be empty', () => {
            const func = jest.fn().mockImplementation(() => {
                throw new Error('fail');
            });
            const compositor = Compositor.each([1, 2], (item) => func());

            const result = compositor.match({
                ok: (values) => {
                    fail();
                    return [];
                },
                err: (err) => {
                    expect(err.length).toBe(2);
                }
            });

            expect(result.length).toBe(0);
        });

        it('Should match success and fails', () => {
            const func = jest.fn().mockImplementation((i) => {
                if (i === 2) {
                    throw new Error('Fail');
                }

                return i;
            });
            const compositor = Compositor.each([1, 2, 3], (item) => func(item));

            const result = compositor.match({
                ok: (items) => items,
                err: (errors) => {
                    expect(errors.length).toBe(1);
                    expect(errors[0].toString()).toEqual(new Error('Fail').toString());
                }
            });

            expect(result.length).toBe(2);
            expect(func).toHaveBeenCalledWith(3);
        });
    });

    describe('Expect', () => {
        it('Should unsafe extract value if all success', () => {
            const items = [1, 2];
            const compositor = Compositor.each(items, (item) => item);

            const results = compositor.expect((err) => new Error('fail'));
            expect(results.length).toBe(2);
        });

        it('Should throw error if one fail', () => {
            const items = [1, 2, 3];
            const compositor = Compositor.each(items, (item) => {
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

describe('Compositor each async', () => {
    describe('Match', () => {
        it('Should match success', async () => {
            const func = jest.fn().mockImplementation((value) => Promise.resolve(value))
            const compositor = Compositor.eachAsync([1, 2], (item) => func(item));

            const result = await compositor.match({
                ok: (values) => values,
                err: (err) => {
                    fail();
                }
            });

            expect(func).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(2);
        });

        it('Should match error and result be empty', async () => {
            const func = jest.fn().mockImplementation(() => Promise.reject(new Error('Mock Error')));
            const compositor = Compositor.eachAsync([1, 2], (item) => func());

            const result = await compositor.match({
                ok: (values) => {
                    fail();
                },
                err: (err) => {
                    expect(err.length).toBe(2);
                }
            });

            expect(result.length).toBe(0);
        });

        it('Should match success and fails', async () => {
            const func = jest.fn().mockImplementation((i) => {
                if (i === 2) {
                    return Promise.reject(new Error('Fail'));
                }

                return Promise.resolve(i);
            });
            const compositor = Compositor.eachAsync([1, 2, 3], (item) => func(item));

            const result = await compositor.match({
                ok: (items) => items,
                err: (errors) => {
                    expect(errors.length).toBe(1);
                    expect(errors[0].toString()).toEqual(new Error('Fail').toString());
                }
            });

            expect(result.length).toBe(2);
            expect(func).toHaveBeenCalledWith(3);
        });
    });

    describe('Expect', () => {
        it('Should unsafe extract value if all success', async () => {
            const items = [1, 2];
            const compositor = Compositor.eachAsync(items, (item) => Promise.resolve(item));

            const results = await compositor.expect((err) => new Error('fail'));
            expect(results.length).toBe(2);
        });

        it('Should throw error if one fail', async () => {
            const items = [1, 2, 3];
            const compositor = Compositor.eachAsync(items, (item) => {
                if (item === 2) {
                    return Promise.reject(new Error('Second error'));
                }

                return Promise.resolve(item);
            });

            const mock = async () => compositor.expect((err) => new Error('Fail'));
            await expect(mock).rejects.toThrowError('Fail');
        });
    });
});

