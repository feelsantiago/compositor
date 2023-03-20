import { Compositor } from '../src/compositor';

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


