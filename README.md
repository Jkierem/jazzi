# Jazzi: Juan's Algebraic Data Structures

Implementations of common structures using ramda for utilities. Available Structures: 

- Either
- IO
- Maybe
- Reader
- Result
- Sink
- Useful Monoids: Sum, Mult, Merge

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

## Either

Either represents a value that can be one of two possibilities, either `Left` or `Right` (badum tssss). By convention `Left` is treated as the error case and `Right` as the happy path but they are just two possibilities. The default constructor receives a left value `l` and right value `r` where if `r` is neither null nor undefined then we get `Right r` otherwise we get a `Left l`. There is a curried version of the `fromFalsy` constructor that was made for convenience.

```javascript
const default42 = Either.defaultTo(42);
defaultTo42(undefined) // returns Left 42
defaultTo42(6 * 9) // return Right (6 * 9)
```

It also has useful map functions for both left and right. The map functions are:

- Right maps: `map`     ,`ifRight` , `mapRight`
- Left  maps: `mapError`,`ifLeft`  , `mapLeft`


## Maybe

Maybe represents the possibility of the absensce of value. `Just` for values, `None` for no values. The default constructor returns `Just` of truthy values and `None` otherwise. Unlike Either where `Left` and `Right` both behave like functors, `None` does not behave like a functor, rather `map` of a `None` simply returns the structure unchanged.

```javascript
Maybe.of(42)    // Just 42
Maybe.of(false) // None
```

## Result

Result represents the result of a computation that could fail, with `Ok` meaning all went well and `Err` as something went wrong. The default constructor receives a function that may throw an error, returning `Ok` of the result or `Err` of the error. Like `Either`, it has a `mapError` function for handling adversity. 

```javascript
Result.of(() => 42) // returns Ok 42
Result.of(() => { throw 42 }) // returns Err 42
```

Has three more constructors:

- `fromFalsy`: `Ok` on truthy, `Err` on falsy
- `fromError`: `Ok undefined` on anything other than Error, `Err Error` of Error
- `attempt`  : alias of `of`

## IO

IO stores a computation and will not run it unless `unsafeRun` is called on it while allowing us to work with the result of said computation and sequencing with other IOs. IO is a lazy monad so mapping and chaining will not execute the computation. The default constructor expects a function but if a value is received, it will wrap it in a nullary function.

```javascript
const log = IO.pure(console.log);

const log42 = IO.of(20)
.map(x => x + 1)
.peak(console.log) // Does nothing yet
.map(x => x * 2)
.flatMap(log) // Does nothing yet

log42.unsafeRun() // logs 21 then logs 42
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
```

## Sink

The sink works as an accumulator of Monoids for combining them at a later point in time. The default constructors receive a base Monoid and will start accumulating Monoids through calls to the `tell` and `forward` method. `forward` will attempt to wrap the received value in a Monoid of the current type. If the default constructor receives something that it does not perceive to be a Monoid, it will throw an Error. To force a sink with any value, use `Sink.force` (use at your own risk).
To run the combination simply call `run` or `get`. Difference between `run` and `get` is that `run` receives a function that expects the sink as an argument while `get` simply combines the current sink. `flush` clears the current combinations. The functions provided by a sink should only be called inside a `run` function and `run` will return a new sink with the accumulated Monoids.
Unlike other structures, Sink has many utility constructors for the use cases.

```javascript
Sink.of(42) // Error: Invariant Violation

Sink.of(Sum.of(2)).run(s => {
    s.tell(Sum.of(20))
    s.forward(20)
}).get() // returns Sum 42

Sink.fromType(Mult).run(s => {
    s.tell(Mult.of(21))
    s.forward(2)
}).get() // returns Mult 42

Sink.sumSink().run(x => {
    x.forward(30)
    x.forward(12)
})
.flush() // clean 
.get() // returns Zero

Sink.sumSink()    // Uses Sum Monoid
Sink.multSink()   // Uses Mult Monoid
Sink.arraySink()  // Uses JS Array as Monoid
Sink.objectSink() // Uses Merge Monoid

const fn = w => w.forward(21)
Sink.runSeq([fn,fn], Sink.sumSink()).get() // returns Sum 42
```

## Sum, Mult and Merge Monoids

`Sum` is the monoid of numbers over addition
`Mult` is the monoid of numbers over multiplication
`Merge` is the monoid of objects over object merging 

Monoids have an empty case. `Cero` for `Sum`, `One` for `Mult` and `Empty` for `Merge`. All Monoid types have a `foldMap` method and an `accumulate` method. There is also a standalone foldMap that receives the Monoid type. They all implement equality and are functors

```javascript
Sum.of(20).concat(Sum.of(22))  // Sum 42
Mult.of(2).concat(Mult.of(21)) // Mult 42
Merge.of({ a: 42 }).concat(Merge.of({ b: 42 })) // Merge { a: 42, b: 42 }

Sum.accumulate([ Sum(20), Sum(22) ]) // Sum 42
Sum.foldMap([10,12,20]) // Sum 42
foldMap(Sum,[10,12,20]) // Sum 42
```