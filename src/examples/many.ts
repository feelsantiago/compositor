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
            .time('All Success')
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
            .time('All Fail')
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

export class ManyAllAsyncExample extends BaseExample {
    constructor() {
        super('Many All Example');
    }

    public async run(): Promise<void> {
        super.header();

        await this.success();
        await this.fail();

        super.footer();
    }

    public async success(): Promise<void> {
        super.method('Success');

        const data = [1, 2, 3];
        const result = await Compositor.allAsync(data, (i) => this.generate(i))
            .retry(3)
            .time('All Success Async')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log(err);
                    return [];
                }
            });

        console.log(result);
    }

    public async fail(): Promise<void> {
        super.method('Fail');

        const data = [1, 2, 3];
        const result = await Compositor.allAsync(data, (i) => this.generate(i, true))
            .retry(3)
            .time('All Fail Async')
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

    private generate(i: number, fail = false): Promise<string> {
        console.log('Called');

        if (i === 2 && fail) {
            return Promise.reject(new Error('Fail'));
        }

        return Promise.resolve('success');
    }
}

export class ManyEachExample extends BaseExample {
    constructor() {
        super('Many Each Example');
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
        const result = Compositor.each(data, (i) => this.generate(i))
            .retry(3)
            .time('Each Success')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log(err);
                }
            });

        console.log(result);
    }

    public fail(): void {
        super.method('Fail');

        const data = [1, 2, 3];
        const result = Compositor.each(data, (i) => this.generate(i, true))
            .retry(3)
            .time('Each Fail')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log('Match Error');
                    console.log(err);
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

export class ManyEachAsyncExample extends BaseExample {
    constructor() {
        super('Many Each Example');
    }

    public async run(): Promise<void> {
        super.header();

        await this.success();
        await this.fail();

        super.footer();
    }

    public async success(): Promise<void> {
        super.method('Success');

        const data = [1, 2, 3];
        const result = await Compositor.eachAsync(data, (i) => this.generate(i))
            .retry(3)
            .time('Each Success')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log(err);
                }
            });

        console.log(result);
    }

    public async fail(): Promise<void> {
        super.method('Fail');

        const data = [1, 2, 3];
        const result = await Compositor.eachAsync(data, (i) => this.generate(i, true))
            .retry(3)
            .time('Each Fail')
            .match({
                ok: (values) => values,
                err: (err) => {
                    console.log('Match Error');
                    console.log(err);
                }
            });

        console.log(result);
    }

    private generate(i: number, fail = false): Promise<string> {
        console.log('Called');

        if (i === 2 && fail) {
            return Promise.reject(new Error('Fail'));
        }

        return Promise.resolve('Success');
    }
}

