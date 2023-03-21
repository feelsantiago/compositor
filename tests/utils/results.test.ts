import { Result } from '../../src/types';
import { Results } from '../../src/utils/results';

describe('Results', () => {
    it('Should group results', () => {
        const results: Result<string>[] = [
            {
                ok: true,
                value: 'test',
            },
            {
                ok: false,
                error: new Error('Mock Error'),
            },
            {
                ok: true,
                value: 'test',
            },
        ];

        const [success, fails] = new Results(results).group();

        expect(success.length).toBe(2);
        expect(fails.length).toBe(1);
    });

    it('Should return empty arrays if no result', () => {
        const [success, fails] = new Results([]).group();

        expect(success.length).toBe(0);
        expect(fails.length).toBe(0);
    });
});

