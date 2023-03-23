import { Compositor } from "../compositor";
import { BaseExample } from "./base";

export class SingleExample extends BaseExample {

    private times = 3;

    constructor() {
        super('Simple Example');
    }

    public run(): void {
        super.header();

        this.fullTimeOperation();

        this.times = 3;
        this.eachTimeOperation();

        super.footer();
    }

    public fullTimeOperation(): void {
        super.method('fullTimeOperation');

        const full = Compositor.do(() => this.generate())
            .retry(3)
            .time('Foo')
            .match({
                ok: (value) => value,
                err: (error) => {
                    console.log(error);
                    return 'fail';
                },
            });

        console.log(full);
    }

    private eachTimeOperation(): void {
        super.method('eachTimeOperation');

        const each = Compositor.do(() => this.generate())
            .time('Foo')
            .retry(3)
            .match({
                ok: (value) => value,
                err: (error) => {
                    console.log(error);
                    return 'fail';
                },
            });

        console.log(each);
    }

    private generate(): string {
        if (this.times == 1) {
            return 'success';
        }

        this.times -= 1;
        throw new Error('Simple error');
    }
}

export class SingleAsyncExample extends BaseExample {
    private times = 3;

    constructor() {
        super('Simple Async Example');
    }

    public async run(): Promise<void> {
        super.header();

        await this.fullTimeOperation();

        this.times = 3;

        await this.eachTimeOperation();

        super.footer();
    }

    public async fullTimeOperation(): Promise<void> {
        super.method('fullTimeOperation');

        const full = await Compositor.doAsync(() => this.generate())
            .retry(3)
            .time('Foo Full')
            .match({
                ok: (value) => value,
                err: (error) => {
                    console.log(error);
                    return 'fail';
                },
            });

        console.log(full);
    }

    private async eachTimeOperation(): Promise<void> {
        super.method('eachTimeOperation');

        const each = await Compositor.doAsync(() => this.generate())
            .time('Foo Each')
            .retryTime(3)
            .match({
                ok: (value) => value,
                err: (error) => {
                    console.log(error);
                    return 'fail';
                },
            });

        console.log(each);
    }

    private generate(): Promise<string> {
        if (this.times == 1) {
            return Promise.resolve('success')
        }

        this.times -= 1;
        return Promise.reject(new Error('Simple error'));
    }
}
