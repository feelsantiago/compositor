import { Compositor } from "../compositor";
import { BaseExample } from "./base";

export class ManyAllExample extends BaseExample {
    constructor() {
        super('Many All Example');
    }

    public run(): void {
        super.header();

        this.success();
        this.fail();

        super.footer();
    }

    public success(): void {
        super.method('Success');

        const data = [1, 2, 3];
        const result = Compositor.all(data, (i) => this.generate(i))
            .retry(3)
            .time('All')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log(err);
                    return [];
                }
            });

        console.log(result);
    }

    public fail(): void {
        super.method('Fail');

        const data = [1, 2, 3];
        const result = Compositor.all(data, (i) => this.generate(i, true))
            .retry(3)
            .time('All')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log('Match Error');
                    console.log(err);
                    return [];
                }
            });

        console.log(result);
    }

    private generate(i: number, fail = false): string {
        console.log('Called');

        if (i === 2 && fail) {
            throw new Error('Fail');
        }

        return 'success';
    }
}
