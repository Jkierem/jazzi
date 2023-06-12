# Jazzi: Juan's Algebraic Data Structures

Implementations of common functional structures. Available structures and features: 

- Either
- Maybe
- Async
- All structures have a toPromise and toThenable methods

# Installing

From npm registry

```shell
npm install jazzi
// or
yarn add jazzi
```

From denoland

```javascript
import * as jazzi from 'https://deno.land/x/jazzi/mod.ts'
```

# Usage

This README.md is a summary of all that is available in jazzi. For more details go to API.md

All structures and global functions are exported as named exports from the jazzi module

```javascript
import { Maybe, Either, Async } from 'jazzi';
// or if you use deno
import { Maybe, Either, Async } from 'https://deno.land/x/jazzi/mod.ts'; 
```

Constructors and operators are exported as named exports of the structure they are meant to be used on. 

```javascript
import * as M from 'jazzi/Maybe';

M.of(40)['|>'](M.map(x => x + 2)) // Just 42
```

A wrapper that mimics a fluent interface is also available

```javascript
import * as M from 'jazzi/Maybe/fluent';

M.of(40).map(x => x + 2)
```

Conversion between the two styles is possible via the wrap and unwrap operators

```javascript
import * as M from 'jazzi/Maybe';
import * as F from 'jazzi/Maybe/fluent';

const pipeToFluent = F.wrap(M.of(41));
const fluentToPipe = F.of(41).unwrap();
```

# Summary

**From this point onwards, all imports are omitted**

All structures have a `toThenable` function that returns an object complies with the thenable interface. This allows for ease of composition with JS Promises and to be used with async/await syntax. In general, all happy cases return inner value, all adverse cases throw inner value. In versions <=2.2.1, the structure was a thenable with a then function. This caused some implicit behavior and the thenable feature was made opt-in with the `toThenable` function.

```javascript
const eitherLeftOrRight = Either.from(/*...*/);
const example = async () => {
    try {
        const x = await eitherLeftOrRight.toThenable()
        console.log(`It was Right ${x}`);
    } catch(e){
        console.log(`It was Left ${e}`)
    }
}
```

It also comes with a `toPromise` function that converts any structure to a promise.

## Maybe

Maybe represents the possibility of the absensce of value. `Just` for values, `None` for no values. The default constructor returns `Just` of truthy values and `None` otherwise. Unlike Either where `Left` and `Right` both behave like functors, `None` does not behave like a functor, rather `map` of a `None` simply returns the structure unchanged.

```javascript
Maybe.of(42)    // Just 42
Maybe.of(false) // None
```

## Either

Either represents a value that can be one of two possibilities, either `Left` or `Right` (badum tssss). By convention `Left` is treated as the error case and `Right` as the happy path but they are just two possibilities. The `from` constructor receives a left value `l` and right value `r` where if `r` is neither null nor undefined then we get `Right r` otherwise we get a `Left l`. There is a curried version of the `fromFalsy` constructor that was made for convenience. The `of` constructor is the same as calling the `from` constructor but passing the same value as both arguments

```javascript
const default42 = Either.defaultTo(42);
defaultTo42(undefined) // returns Left 42
defaultTo42(6 * 9) // returns Right (6 * 9)

const Right42 = Either.attempt(() => 42) // returns Right 42 
const Left42 = Either.attempt(() => { throw 42 }) // returns Left 42 
```

## Async

The Async structure represents an async computation that may need some input. It can be seen as a mix between IO, Reader and a Promise. Unlike IO, run returns a promise with the result of the computation. Like IO, it is a lazy monad. Like Reader, the run method must receive the environment.  

```javascript
const s42 = Async.Success(42)
const f42 = Async.Fail(42)

await s42.run() // resolves with 42
await f42.run() // rejects with 42

const withEnv = Async.from(async (x) => x + 2)
await withEnv.run(40) // resolves with 42

// Environment can be provided using provide
const withEnvProvided = Async.from(async (x) => x + 2).provide(40)
await withEnvProvided.run() // resolves with 42

// Zip sequences two Asyncs and collects the result in a tuple. Left and Right variants discard one result.
// a.zip(b) is equivalent to a.flatMap(x => b.map(y => [x,y]))
await s42.zip(s42).run() // resolves to [42,42]
await s42.zipRight(Async.Success("right")).run() // resolves to "right"
await Async.Success("left").zipLeft(s42).run() // resolves to "left"

// Similar to Promise.all
await Async.all([s42,s42,s42]).run() // resolves to [42,42,42]

// The only way to recover from a Fail
await f42.recover((e) => Async.Success(e)).run() // resolves to 42

await Async.from(() => Promise.resolve(42)).run() // resolves to 42
```


AutoTypes are NewTypes with a predefined definition for typeclasses. The definition is generated assuming the trivial cases for the passed typeclasses. The function `createAutoDefinition` generates the definition used for the typeclasses based on the name of the type.

```javascript
const createAutoDefinition = (name) => ({
    trivials: [name],
    pure: [name],
    resolve: [name],
    order: [name],
    first: name,
    config: { noHelpers: true },
    overrides: {
        fold: {
            [name](fn){ return fn(this.get()) }
        }
    }
})
```

```javascript
// Simple Auto functor
const Boxed = AutoType("Boxed",[Functor])

Boxed.of(42).fmap(x => x + 1) // Boxed 43
```

More on this on API.md