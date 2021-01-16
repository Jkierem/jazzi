# Jazzi: Juan's Algebraic Data Structures

*Now with Do notation*

*Now with thenables*

*Now available for deno too*

Implementations of common structures using ramda for utilities. Available Structures and features: 

- Either
- IO
- Maybe
- Reader
- Result
- Useful Monoids: Sum, Mult, Merge
- Moar Monoids: Max, Min, First, Last
- A function to create Tagged Unions/Sum types: Union
- A way to implement typeclasses and use prototype inheritance. More on this on API.md
- Pre built typeclasses available to use. More on this on API.md 
- A way to create C++ style Enums but with a haskell-ish feel: the EnumType function
- All structures are thenable objects and have a toPromise method

# Installing

From npm registry

```shell
npm install jazzi
// or
yarn add jazzi
```

From denoland

```javascript
import * as jazzi from 'https://deno.land/x/jazzi/index.js'
```

# Usage

This README.md is a summary of all that is available in jazzi. For more details go to API.md

All functionalities are exported as named exports from the jazzi module

```javascript
import { Maybe, Either, IO, Reader, foldMap, match } from 'jazzi';
// or if you use deno
import { Maybe, Either, IO, Reader, foldMap, match } from 'https://deno.land/x/jazzi/index.js'; 
```

# Summary

**From this point onwards, all imports are omitted**

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

Also all Monads have a `run` and an `unsafeRun` method. This methods make sense for the lazy monads that store computations (`IO`,`Reader`). For the other Monads, it will do nothing.

All structures have a `then` function that complies with the thenable interface. This allows for ease of composition with JS Promises and to be used with async/await syntax. In general, all happy cases return inner value, all adverse cases throw inner value.

```javascript
const eitherLeftOrRight = Either.from(/*...*/);
const example = async () => {
    try {
        const x = await eitherLeftOrRight
        console.log(`It was Right ${x}`);
    } catch(e){
        console.log(`It was Left ${e}`)
    }
}
```

It also comes with a `toPromise` function that converts any structure to a promise, given that they implement the `Thenable` typeclass.

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
- `fromError`: `Ok` on anything other than Error, `Err Error` of Error
- `attempt`  : alias of `of`

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

## Sum, Mult and Merge Monoids

`Sum` is the monoid of numbers over addition

`Mult` is the monoid of numbers over multiplication

`Merge` is the monoid of objects over object shallow merging. 

Monoids have an empty case. `Cero` for `Sum`, `One` for `Mult` and `Empty` for `Merge`. All Monoid types have a `foldMap` method and an `accumulate` method. There is also a standalone foldMap that receives the Monoid type. They all implement equality and are functors

```javascript
Sum.of(20).concat(Sum.of(22))  // Sum 42
Mult.of(2).concat(Mult.of(21)) // Mult 42
Merge.of({ a: 42 }).concat(Merge.of({ b: 42 })) // Merge { a: 42, b: 42 }

Sum.accumulate([ Sum(20), Sum(22) ]) // Sum 42
Sum.foldMap([10,12,20]) // Sum 42
foldMap(Sum,[10,12,20]) // Sum 42
```

## A note on Max, Min, First, Last

This monoids abstract operations over arrays with the caveat that for `Max` and `Min` need the values to be comparable with `>` and `<` respectively. `First` and `Last` will return a structure with `undefined` if the array is empty. They all share that calling the default constructor without any arguments returns the empty value. The empty values for each Monoid are as follows:

- `Max.of(-Inifinity)`
- `Min.of(Infinity)`
- `First.of(undefined)`
- `Last.of(undefined)`

You can use them like you would use the previous Monoids:

```javascript
Max.of(20).concat(Max.of(42)) // Max 42
Min.of(20).concat(Min.of(42)) // Max 20
First.of(20).concat(First.of(42)) // First 20
Last.of(20).concat(Last.of(42)) // Last 42

const values = [1,2,3,4,5]
foldMap(Max  ,values)   // Max 5
foldMap(Min  ,values)   // Min 1
foldMap(First,values)   // First 1
foldMap(Last ,values)   // Last 5

```

## Creating Tagged Unions/Sum types and Typeclasses

Jazzi provides a way to do this through the `Union` function. Typeclasses are used mostly as a means to recycle code. Types created with Union cannot be extended (working on it). Some typeclasses are avaialable out of the box but they are simply higher order functions that receive definitions to alter the prototypes of the case constructors. This is the definition of the Maybe Functor:

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

// This will return Left of ValidationError or Right of name
const validateName = (name) => {
    return Either.do(function*(pure){
        yield Either.of(ValidationError.TooLong , name.length > 20)
        yield Either.of(ValidationError.TooShort, name.length < 7 )
        return pure(name)
    })
}

const verifyAvailable = async (/*....*/) => {
    // Assume this does async stuff
}

const doSomethingAsync = async (name) => {
    try {
        await validateName(name)
        await Either.of(ValidationError.Taken   , await verifyAvailable(name) )
    } catch(e) {
        e.match({
            TooShort: () => console.log("Must be longer"),
            TooLong : () => console.log("Must be shorter"),
            Taken   : () => console.log("Must be unique")
        })
    }
}
```

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