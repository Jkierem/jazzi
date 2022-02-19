# Jazzi: Juan's Algebraic Data Structures

Implementations of common functional structures. Available structures and features: 

- Either
- IO
- Maybe
- Reader
- Async
- Merge Monoid
- A function to create Tagged Unions/Sum types: Union
- A way to implement typeclasses and use prototype inheritance. More on this on API.md
- Pre built typeclasses available to use. More on this on API.md 
- A way to create Enums with a haskell-ish feel: the EnumType function
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
import { Maybe, Either, IO, Reader, foldMap, match } from 'jazzi';
// or if you use deno
import { Maybe, Either, IO, Reader, foldMap, match } from 'https://deno.land/x/jazzi/mod.ts'; 
```

Pipeable operators are exported as named exports of the structure they are meant to be used on. 

```javascript
import { Maybe } from 'jazzi';
import { map } from 'jazzi/Pipe/Maybe';

Maybe
.of(40)
.pipe(map(x => x + 2)) // Just 42
```

# Summary

**From this point onwards, all imports are omitted**

The library has three kinds of functions inside: Data first, methods or pipeable operators. Data first are functions that are brought from the `jazzi` export and receive all the data they need from parameters. Methods are baked into the structures and are to be used as you would use methods of a class. Pipeable operators are functions that do the same as the method counterpart but do so through the pipe method. The method chaining style is suggested but other ways are completely equivalent.

```javascript
const m42 = Maybe.of(42)
// Data first style
show(m42)

// Method style
m42.show()

// Pipe style
m42.pipe(show)
// And alternate pipe style inspired by other libraries and the pipeline proposal
m42['|>'](show)
```

All structures share a common set of functions to be used. In terms of nomenclature, all constructor functions start with "from". All structures have a default constructor named "of" and "from" that are the most common use of the structure. They all have a "match" function that is case-insensitive to make matches. Due to the use of objects for matching, Order of cases does not alter the result. Matching has two reserved keys for default cases: "default" and "_"(underscore). "default" precedes over underscore and a matching type precedes over default cases. Matching is done with the name of the variant meaning you match using `Just` instead of `Maybe` and is not possible the other way around. Match will return evaluation of the case with the inner value or `undefined` if no case matches.

```javascript
Maybe.of(42).match({
    Just: x  => console.log(`The answer is ${x}`),
    None: () => console.log("Nothing")
})
// Or use the global match
match(Maybe.of(42), {
    Just: x  => console.log(`The answer is ${x}`),
    None: () => console.log("Nothing")
})
// Or using the pipeable match operator
Maybe
.of(42)
.pipe(
    match({
        Just: x  => console.log(`The answer is ${x}`),
        None: () => console.log("Nothing")
    })
)
```

If you want to validate that a value is an instance of a type you can use the `instanceof` operator and you can use the `hasInstance` function to check if it implements a typeclass

```javascript
const a = Maybe.Just(42)

a instanceof Maybe // true
a instanceof Maybe.Just // true
a instanceof Maybe.None // false

hasInstance(Functor, a) // true
hasInstance("Functor", a) // true
hasInstance(Ord, a) // false
```

All structures have utility functions to extract the inner value. The base two which are `get` and `unwrap`.

```javascript
Maybe.Just(42).get() // returns 42
Maybe.Just(Maybe.Just(Maybe.Just(42))).unwrap() // returns 42
```

If they have more than one variant, they also have `on` functions that call the provided function if the case matches the name or call get on the structure otherwise.

```javascript
Maybe.Just(42).onNone(() => false) // returns 42
Maybe.Just(42).onJust(() => false) // returns false
```

All Monadic Types have a `do` function to chain Monads using `do-notation` through generator functions:

```javascript
const just21 = Maybe.of(21)

just21.flatMap(a => just21.flatMap(b => Maybe.of(a + b)))

// Can be written as

Maybe.do(function*(pure){
    const a = yield just21
    const b = yield just21
    return pure(a + b)
})

// Which is the same as

Maybe.do(function*(){
    const a = yield just21
    const b = yield just21
    return Maybe.pure(a + b)
})
```

**Keep in mind**: Do expects that the return value of the generator to be of the same type as the caller of do, so it is advised to use the provided `pure` on return.

**This is sugar for chain**: It will call chain on the `yield`'ed values. Although, due to the nature of JS you *can* chain different monads, I would advise against it.

**The types are not the best**: Honestly, the way generators are handled in TS are not ideal. The solution was using `yield*` expressions and an adapter but I don't like that approach so I left it as is.

Also all Monads have a `run` and an `unsafeRun` method. This methods make sense for the lazy monads that store computations (`IO`,`Reader`). For the other Monads, it will do nothing.

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

It also comes with a `toPromise` function that converts any structure to a promise, given that they implement the `Thenable` typeclass.

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

It also has useful map functions for both left and right. The map functions are:

- Right maps: `map`     ,`ifRight` , `mapRight`
- Left  maps: `mapError`,`ifLeft`  , `mapLeft`

## IO

IO stores a computation and will not run it unless `unsafeRun` is called on it while allowing us to work with the result of said computation and sequencing with other IOs. IO is a lazy monad so mapping and chaining will not execute the computation. The default constructor expects a function but if a value is received, it will wrap it in a nullary function.

```javascript
const ioLog = IO.unary(console.log);
// Shorthand for:
// const ioLog = str => IO.of(() => console.log(str));

const log42 = IO.of(20)
.map(x => x + 1)
.peak(console.log) // Does nothing yet
.map(x => x * 2)
.flatMap(ioLog) // Does nothing yet

log42.unsafeRun() // logs 21 then logs 42

// Let's try that in do-notation
const doLog42 = IO.do(function*(){
    const a = yield IO.of(20)
    yield ioLog(a + 1)
    return ioLog((a + 1) * 2)
})

doLog42.unsafeRun()
```

## Reader

The Reader monad is used to inject dependencies to functions. It is way to avoid passing around useless arguments that are only needed because an inner function needs it. It is the only other lazy structure so its string representation will look like IO's representation and behaves very similar to IO. It has a `run` method that runs the reader and a function on the type called `runReader`. The run methods will receive the enviroment (or arguments) that the Reader uses. It is a Monad so expect everything that entails

In this example we have two functions `log` and `logSomething`. `logSomething` receives the logger just to pass it to `log`

```javascript
const log = (something,logger) => logger.log(something)

const logSomething = (logger) => { 
    log("something",logger) 
    log("else",logger)
};

logSomething(console)
```

to avoid akwardly passing arguments around, we can use Reader

```javascript
const log = something => Reader.of(logger => logger.log(something))

const logSomething = () => log("something").chain(() => log("else"));

logSomething().run(console); // logs "something" then "else"

// Now in do notation!
Reader.do(function*(){
    yield log("something")
    return log("else")
}).run(console)
```

This is simple example but there are tons of uses for the Reader monad.

## Async

The Async structure represents an async computation that may need some input. It can be seen as a mix between IO, Reader and a Promise. Unlike IO, run returns a promise with the result of the computation. Like IO, it is a lazy monad. Like Reader, the run method must receive the environment.  

```javascript
const s42 = Async.Success(42)
const f42 = Async.Fail(42)

await s42.run() // resolves with 42
await f42.run() // rejects with 42

const withEnv = Async.from(async (x) => x + 2)
await withEnv.run(40) // resolves with 42

// Environment can be provided using the provide family of functions
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

// Constructors to deal with different async styles
await Async.from(() => Promise.resolve(42)).run() // resolves to 42
await Async.fromPromise(Promise.resolve(42)).run() // resolves to 42
await Async.fromCallback((res) => setTimeout(() => res(42),0)).run() // resolves to 42
```

***A Note on the Async constructors***: There is no way to stop a created promise from executing. This results in the fromPromise constructor being a sort of eager Async. All other constructors are lazy given that they are passed a function that builds a promise as argument. So keep that in mind if lazyness is desired

## Merge Monoid

`Merge` is the monoid of objects over object shallow merging. 

Monoids have an empty case. `Empty` for `Merge`. All Monoid types have a `foldMap` method and an `accumulate` method. There is also a standalone foldMap that receives the Monoid type. They all implement equality and are functors. Previously, there were more monoids implemented (Min, Max, Sum, Mult, First and Last) but they had little use so they were removed. Check versions before v3 to see them.

```javascript
Merge.of({ a: 42 }).concat( Merge.of({ b: 42 })) // Merge { a: 42, b: 42 }

Merge.accumulate([ Merge({ a: 43 }), Merge({ a: 42 }) ]) // Merge { a: 42 }
Merge.foldMap([{ a: 42 },{ b: 42 },{ c: 42 }]) // Merge { a: 42, b: 42, c: 42 }
foldMap(Merge,[{ a: 42 },{ b: 42 },{ c: 42 }]) // Merge { a: 42, b: 42, c: 42 }
Merge.pipe(foldMap([{ a: 42 },{ b: 42 },{ c: 42 }])) //  Merge { a: 42, b: 42, c: 42 }
```

## Creating Tagged Unions/Sum types and Typeclasses

Jazzi provides a way to do this through the `Union` function. Typeclasses are used mostly as a means to recycle code. Types created with Union cannot be extended. Some typeclasses are avaialable out of the box but they are simply higher order functions that receive definitions to alter the prototypes of the case constructors. This is the definition of the Maybe Functor:

```javascript
const Maybe = Union({
    name: "Maybe",
    cases: {
        Just: x => x,
        None: () => {}
    },
    constructors: {
        fromFalsy(x){
            return x ? this.Just(x) : this.None()
        }
    },
    extensions: [
        Functor({
            trivials: ["Just"],
            identities: ["None"]
        })
    ]
})
```

This is an example of some typeclass `Loggable` that defines an operation `logValue`:

```javascript
const Loggable = (defs) => (cases,global) => {
    const { visible, invisible } = defs
    cases[visible].prototype.logValue = function(){
        console.log(this.get())
        return this
    }
    cases[invisible].prototype.logValue = function(){
        return this
    }
}

const Boxed = Union({
    name: "Boxed",
    cases: {
        Box: x => x,
        NotBox: x => x
    },
    extensions: [
        Loggable({ visible: "Box", invisible: "NotBox" })
    ]
})

Boxed.Box(42).logValue() // logs 42
Boxed.NotBox(42).logValue() // does nothing
```

## Enumerations

If enums want to be used, there is a shorthand for it. Instead of creating an Union and implementing the Enum typeclass, the EnumType function does that and adds some extra functionality:

```javascript
const Nat = EnumType("Natural",["One","Two","Three"]);
```

EnumTypes are nullary and thus don't provide any constructors. Instead, the cases are properties of the type and are treated as singletons.

```javascript
const { One, Two, Three } = Nat;

One.compare(Two) // returns Ordering.LT
```

These are usefull when you need types that don't represent a value other than their type. For validation works well. A real example would be something along these lines:

```javascript
const ValidationError = EnumType("ValidationError",["TooLong","TooShort","Taken"])

const verifyAvailable = async (name) => {
    return name !== "jazzi"
}

const doSomethingAsync = async (name) => {
    try {
        const isAvailable = await verifyAvailable(name)
        return await Either.do(function*(pure){
            yield Either.fromFalsy(ValidationError.Taken   , isAvailable)
            yield Either.fromFalsy(ValidationError.TooLong , name.length < 21)
            yield Either.fromFalsy(ValidationError.TooShort, name.length > 4 )
            return pure(name)
        }).toThenable()
    } catch(e) {
        if( e instanceof ValidationError ){
            const errorMessage = e.match({
                TooShort: () => "Must be longer",
                TooLong : () => "Must be shorter",
                Taken   : () => "Must be unique"
            })
            throw new Error(errorMessage)
        }
        throw e
    }
}
```

If you need an EnumType that can hold a value, there is also BoxedEnumType

More on this in API.md

## NewTypes

NewTypes are unary Unions with a single variant with the name of the type (which is the first argument of the function). They come with all the utilities of a Union and two extra constructors: of and from. They are aliases of the case constructor. They can be extended like any other union.

```javascript
// Simple functor
const Boxed = NewType("Boxed",[
    Functor({ trivials: ["Boxed"] })
])

Boxed.of(42).fmap(x => x + 1) // Boxed 43
```

More on this on API.md

## AutoTypes

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