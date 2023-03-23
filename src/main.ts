import { ManyAllAsyncExample, ManyAllExample, ManyEachAsyncExample, ManyEachExample } from "./examples/many";
import { SingleAsyncExample, SingleExample } from "./examples/single";
import { EncaseAsync } from "./operations/encase";
import { Result } from "./types";

// const single = new SingleExample();
// single.run();

// const all = new ManyAllExample();
// all.run();

// const each = new ManyEachExample();
// each.run();

// (async () => {
//     const singleAsync = new SingleAsyncExample();
//     await singleAsync.run();

//     const allAsync = new ManyAllAsyncExample();
//     await allAsync.run();

//     const eachAsync = new ManyEachAsyncExample();
//     await eachAsync.run();
// })();

function setInTime<T>(times: number, retry: number, delegate: () => Promise<Result<T>>, callback: (result: Result<T>) => void): void {
    setTimeout(async () => {
        console.log('CALLED');
        const result = await delegate();
        if (result.ok || retry === 1) {
            return callback(result);
        }

        return setInTime(times, retry - 1, delegate, callback);

    }, 1000 * (times - retry));
}


async function retryTime<T>(times: number, delegate: () => Promise<Result<T>>): Promise<T> {
    return new Promise((resolve, reject) => {
        setInTime(times, times, delegate, (result) => {
            if (result.ok) {
                return resolve(result.value);
            }

            reject(result.error);
        });
    });
}

(async () => {
    let time = 3;
    const func = () => EncaseAsync.run(() => {
        if (time == 1) {
            return Promise.resolve('success');
        }

        time -= 1;
        return Promise.reject('Failure');
    });

    try {
        console.log('Started');
        const result = await retryTime(3, func);
        console.log(result);
    } catch (error) {
        console.log('Failure');
        console.log(error);
    }
})();

