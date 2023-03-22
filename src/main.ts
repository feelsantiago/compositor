import { ManyAllExample, ManyEachExample } from "./examples/many";
import { SingleAsyncExample, SingleExample } from "./examples/single";

const single = new SingleExample();
single.run();

const all = new ManyAllExample();
all.run();

const each = new ManyEachExample();
each.run();

(async () => {
    const singleAsync = new SingleAsyncExample();
    await singleAsync.run();
})();
