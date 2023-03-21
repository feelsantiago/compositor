export class BaseExample {
    constructor(public readonly name: string) { }

    public header(): void {
        console.log('\n');
        console.log(`============ ${this.name} ===============`);
    }

    public method(name: string) {
        console.log('\n');
        console.log(`============= ${name}`);
    }

    public footer(): void {
        console.log('\n');
        console.log(`============ ================ ===============`);
    }
}
