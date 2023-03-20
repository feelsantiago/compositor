import { Compositor } from "./compositor";

let times = 3;

function foo() {

    if (times == 1) {
        return 'success';
    }

    times -= 1;
    throw new Error('Simple error');
}

// Time for entire operation
const full = Compositor.do(() => foo())
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

console.log('\n');

// Time for each try
times = 3;

const each = Compositor.do(() => foo())
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
