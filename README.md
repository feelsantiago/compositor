Compositor is a small lib to wrap function calls that can possible throw errors to improve readability and extends functions behaviors.

## How it works

We can wrap any function into the `Compositor` using help methods

```typescript
function foo() {
	throw new Error('Example');
}

async function fooAsync() {
	return Promise.reject(new Error('Example'));
}

const compositor = Compositor.do(() => foo());
const compositor = Compositor.doAsync(() => fooAsync());
```

A wrapped function it's not executed until you explicit match (Rust-Like) possible results 

```typescript
const result = Compositor.do(() => foo())
	.match({
		ok: (value) => value,	
		err: (err) => {
			// do something with the error and return a default value
			notify(err);
			return 'Not found';
		}
	});

const result2 = await Compositor.do(() => fooAsync())
	.match({
		ok: (value) => value,	
		err: (err) => {
			// do something with the error and return a default value
			notify(err);
			return 'Not found';
		}
	});
``` 

You can also unwrap the result and throw exception up in the stack call

```typescript
const result = Compositor.do(() => foo())
	// Expect will be called if foo fail
	.expect((err) => new CustomException('Failure', err));

```

## Composability

The compositor can build a simple pipeline to extends wrapped function behavior

- `Time` - will log time execution for the wrapped function

```typescript
const result = await Compositor.do(() => foo())
	.time('Foo')
	.expect((err) => err);
```

- `Retry` - will retry the operation

```typescript
const result = await Compositor.do(() => foo()) 
	.retry(3) // Retry three times 
	.match({
		ok: (value) => value,	
		err: (err) => {},
	});
``` 

- `RetryTime` - will retry the operation waiting seconds before each retry

```typescript
const result = await Compositor.do(() => fooAsync())
	.retryTime(3)
	.expect((err) => err);
```

`retryTime(times: number, seconds?: number = 1)`

Retry time use the `seconds` variables to schedule the next retry, doubling each time.

For `seconds = 1` and `times = 3`: 

- First call immediately
- First retry - 2 second
- Second retry - 4 seconds
- Third retry - 8 seconds

**Retry Time can only be used with async compositor!**

## Iterables

You can wrap iterables in two ways

- `All`

Work like `Promise.all()`. If a error occurs the whole operation is set as a failure and will match with error or throw the expect callback.

```typescript
const itens = [1, 2, 3];
const results = Compositor.all(items, (item) => foo(item))
	.match({
		ok: (values) => values,	
		// No need to return a value, if match error, results
		// will always be a empty array
		err: (err) => notify(err)
	});

const results = await Compositor.allAsync(items, (item) => fooAsync(item))
	// if one fail throw a exception
	.expect((err) => err);
```

- `Each` 

Work sequential, only goes to the next when the current is over

```typescript
const itens = [1, 2, 3];

// if no success results will be a empty array
const results = Compositor.each(items, (item) => foo(item))
	.match({
		// It's called if has at least one success
		ok: (values) => values,	
		// It's called if has at lest one error
		err: (err) => notify(err)
	});

const results = await Compositor.eachAsync(items, (item) => fooAsync(item))
	.expect((err) => err);
``` 

## Examples

```typescript
const result = await Compositor.eachAsync(items, (item) => fooAsync(item))
	// Time the each operation
	.time('Foo')
	// Retry each 3 times
	.retryTime(3)
	.match({
		ok: (values) => values,	
		err: (errors) => notify(errors),
	});

const operation = await Compositor.doAsync(() => foo())
	// Retry 3 times
	.retry(3)
	// Time the whole operation
	.time('Foo')
	// If fails throw an exception
	.expec((err) => err);
```

You can see more examples in `src/examples`.

