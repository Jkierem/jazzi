The function signature notation used is similar to haskell's type notations with a little modification. Although it looks like the functions are curryed, they are not (unless specified). For object method calls, the type of the object is given using the "~>" as seen in this example:

```javascript
// "~>" used to define the object's type
// This means map must be called on an array object
// and that the object is an array of a's
// map :: [a] ~> (a -> b) -> [b]
[1,2,3].map(() => 42)

// match :: Cases c, Maybe m => m a ~> c (m a) -> *
// "=>" type constraints are always before the implicit object
// "Cases c" means "c" is of type Cases
// "Maybe m" means "m" is of type Maybe
// "match" is a method called on a "Maybe" object and
// "m a" is a Maybe of a type "a"
// "c (m a)" is Cases of a Maybe of a type "a"
// "*" just means "any type"
```


# Union and Typeclasses

This library implements typeclasses as functions that alter the prototype of the cases of a given union. The functions receive an object with their definitions and return a function that receives the cases and alters their prototype. Cases are the equivalent to data constructors or at least in this library. The word "variant" is used as a synomyn to "case". In general, a `trivial` case is one that uses the default implementation, an `identity` case is one that either does nothing or that returns its argument and a `empty` case is one that does not need the inner value to excecute the operation. `overrides` are cases that have their own implementation. If an attribute of `overrides` is a function itself it is a "general implementation". Example usage of Union to create Maybe Functor with Eq and Show:

```javascript
import { Union, Functor, Eq, Show } from 'jazzi'

// Cases are functions to map the received values to the case construction
// They will be used internally to build the inner value
const cases = {
    Just: x => x,
    None: () => {}
}

// This is the array of typeclasses that the union implements
// Each typeclass receives the definitions and returns a function that
// alters the prototype of the case constructor functions
// A typeclass has the following signature:
// typeclass: (definitions) -> (cases,globals) -> void
// where 
//  definitions are the required definitions for the implementation
//  cases is an object with constructor functions for each case
//  globals is an object that references the type. Used to define methods on the type
const extensions = [
    Eq({
        trivials: ["Just"],
        empties: ["None"],
    }),
    Functor({
        trivials: ["Just"],
        identities: ["None"],
    }),
    Show({
        overrides: {
            show: {
                Just(){ return `[Maybe => Just ${this.get()}]` },
                None(){ return `[Maybe => None]` },
            }
        }
    })
]

// Union configuration. Can be used to set flags that 
// alter the construction of the union. By default all flags start as false.
// The only available flag is noHelpers that removes the `on` and `is` methods
const config = {
    noHelpers: false
}

// Constructors: By default, there are constructors for each case.
// This is to add more constructors other than the default. 
// They cannot be arrow functions due to the need to be bound to the case constructors.
// The this value is an object with the default constructors
const constructors = {
    of(x){ x ? this.Just(x) : this.None() }
}

// This is the partial definition of Maybe
// Since 1.3.x
const Maybe = Union({
    name: "Maybe",
    cases,
    extensions,
    constructors,
    config
})

Maybe.of(41).map(x => x + 1)   // Just 42
Maybe.of(null).map(x => x + 1) // None
Maybe.Just(42).show()          // [Maybe => Just 42]
```

A more lightweight way of constructing types is NewType. This is a Union with a single case constructor. It implements two extra constructors: of and from. They are aliases of the case constructor. It comes with all the functionalities of Union but with a less cluttered interface for when that is wanted.

```javascript
// Simple functor tap monad
const Boxed = NewType("Boxed",[
    Functor({ trivials: ["Boxed"] }),
    Tap({ trivials: ["Boxed"] }),
    Monad({ pure: "Boxed", trivials: ["Boxed" ]})
])

Boxed.of(42)
.fmap(x => x + 1)          // returns Box 43
.tap(console.log)       // logs 43 and returns Box 43
.chain(x => Box.of(x + 4)) // returns Box 47
```

An even shorter version of NewType is AutoType. AutoType assumes the most simple definition for any provided typeclass.

```javascript
// Auto functor tap monad
const Boxed = AutoType("Boxed",[Functor, Tap, Monad])

Boxed.of(42)
.fmap(x => x + 1)          // returns Box 43
.tap(console.log)       // logs 43 and returns Box 43
.chain(x => Box.of(x + 4)) // returns Box 47
```

AutoType just receives the typeclasses as it will generate a definition object from the type name

```javascript
const autoDef = (name) => ({
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

In typescript, you will have to provide typing for the generated type. Types for the type classes are exported.

The following typeclasses are available:

## Applicative

Defines a structure that can apply its inner value to the inner value of another applicative. A type that implements this typeclass has to define a list of trivial cases and a list of identity cases. The overrides are taken from `apply` key of overrides.

- Definitions: 
    - trivials: string[]
    - identities: string[]
- Overrides:
    - apply

| method | description |
| ------ | ----------- |
| apply :: Applicative f => f a ~> f (a -> b) -> f b | applies the inner value of the structure to the inner value of the received structure if the applicative is a case with a definition of apply or if it is a trivial case. If the applicative being called is an identity, it simply returns itself without a change |

## Functor

Defines a structure that can be mapped over a given function without leaving the context of the functor meaning that the map operation always returns the same type variant and remains in the same context. Requires the definition of trivial cases and identity cases if the default implementation wants to be used. The overrides are taken from `fmap` key of overrides

- Definitions: 
    - trivials: string[]
    - identities: string[]
- Overrides:
    - fmap: object

| method | description |
| ------ | ----------- |
| map :: Functor f => f a ~> (a -> b) -> f b | if trivial case, maps the functor over the given function. If it is an identity case does nothing |
| fmap :: Functor f => f a ~> (a -> b) -> f b | alias of map

## FunctorError

Defines a mapError operation that behaves like map but maps over the error cases and all other cases behave like an identity. It is a way to handle error cases and map them. Although it does not need to be a functor, it is implied and suggested. The overrides are taken from `mapError` key of overrides

- Definitions: 
    - errors: string[]
- Overrides:
    - mapError: object

| method | description |
| ------ | ----------- |
| mapError :: FunctorError f => f a ~> (a -> b) -> f b | if error case, maps the functor over the given function. Otherwise does nothing |

## Tap

This typeclass defines a way to look into a structure without altering it. Usually runs tasks considered as side effects hence the name. It requires the definition of trivial cases and identity cases if the default implementation wants to be used.

- Definitions: 
    - trivials: string[]
    - identities: string[]
- Overrides:
    - effect: object

| method | description |
| ------ | ----------- |
| tap :: Tap f => f a ~> (a -> ()) -> f a | runs the given function without altering the structure if trivial. Does nothing if identity |
| peak   :: Tap f => f a ~> (a -> ()) -> f a | alias of tap |
| matchEffect :: Cases c, Tap f => f a ~> c f a -> f a | matches against patterns and runs effect function |
| when        :: Cases c, Tap f => f a ~> c f a -> f a | alias of matchEffec |

## Enum

This typeclass defines a set where each element has a succesor and predecesor. To define a implementation of Enum you need to either provide an explicit order or provide a general implementation of `fromEnum` and `toEnum` through overrides. If no implementaion is given the default order used is the result from `Object.keys(cases)`.

- Definitions: 
    - order: string[]
- Overrides:
    - fromEnum: Function
    - toEnum: Function

Defines the following methods on values:

| method | description |
| ------ | ----------- |
| succ :: Enum a => a ~> () -> a | returns the succesor of the Enum value or `undefined` if it has no succesor. |
| pred :: Enum a => a ~> () -> a | returns the predecesor of the Enum value or `undefined` if it has no predecesor. |

Defines the following methods on the type:

| method | description |
| ------ | ----------- |
| succ :: Enum a => a -> a | returns the succesor of the Enum value or `undefined` if it has no succesor. |
| pred :: Enum a => a -> a | returns the predecesor of the Enum value or `undefined` if it has no predecesor. |
| toEnum :: Enum a => Integer -> a | returns the corresponding Enum for the given integer value `undefined` if the value is either negative, not an integer or there does not exist a corresponding Enum value. |
| fromEnum :: Enum a => a -> Integer | returns the corresponding Integer value for the given Enum value |

### A note on EnumType

Used to create enumerations where the tags are the values themselves. Due to this behavior, they have no constructors available and the values are accessed as attributes of the type. This is for ease of use. They also implement `Eq`,`Ord`, `Enum` and `Show` (having a special implementation for `Show` as they contain no values). One example of an enumaration is the `Ordering` provided by jazzi

```javascript
import { EnumType } from 'jazzi'

const Natural = EnumType("Natural",[ "Zero", "One", "Two" ]);

const { Zero , One , Two } = Natural;

Zero.succ()       // Natural.One
Zero.equals(Zero) // true
Zero.compare(One) // Ordering.LT
Two.compare(One)  // Ordering.GT
Two.show()        // [Natural => Two]
```

## Eq

Defines equality for a structure. Needs to have the trivials and empties definitions if the default implementation wants to be used. For trivials, it compares variant and inner value with deep equality. For empty cases, only compares variant since empty cases should have no inner value.

- Definitions: 
    - trivials: string[]
    - empties: string[]
- Overrides:
    - equals: object

| method | description |
| ------ | ----------- |
| equals :: Eq a ~> Eq b -> Boolean | checks for equality |

Also defines a method on the type:

| method | description |
| ------ | ----------- |
| equals :: Eq a -> Eq b -> Boolean | check for equality calling equals method on the first argument |

## Filterable

Defines a type than can be filtered. The trivial case implementation calls filter on the inner value. The identity case returns the same structure unchanged

- Definitions: 
    - trivials: string[]
    - identities: string[]
- Overrides:
    - filter: object

| method | description |
| ------ | ----------- |
| filter :: Filterable f => f a ~> (a -> Boolean) -> f a | filters the structure |

## Foldable

Defines a type that has a fold method. There is no default implementation. Must be implemented.

- Definitions: N/A
- Overrides:
    - fold: object

| method | description |
| ------ | ----------- |
| fold :: Foldable f => f a b -> (a -> c) -> (b -> d) -> c \| d | folds the structure. Used to break the structure |

## Monad

Defines a monadic type with a pure, join and a chain method. Like other typeclasses, needs the definitions of trivial and identity cases. Trivial chain case returns the value of evaluating the given function. Identity chain cases do nothing and return the structure unchanged. Requires to have a pure case defined.

- Definitions: 
    - trivials: string[]
    - identities: string[]
    - pure: string
- Overrides:
    - chain: object
    - run: object

| method | description |
| ------ | ----------- |
| chain :: Monad m => m a ~> (a -> m b) -> m b | calls the provided function with the inner value. Expects the function to return a Monad of the same type |
| bind :: Monad m => m a ~> (a -> m b) -> m b | alias of chain |
| flatMap :: Monad m => m a ~> (a -> m b) -> m b | alias of chain |
| join :: Monad m => m (m a) ~> () -> m a | breaks nested monad one level deep |

Also defines a method on the type 

| method | description |
| ------ | ----------- |
| pure :: Monad m => a -> m a | constructs a monadic value |
| do :: Monad m => m a ~> ((a -> m a) -> m a)* -> m a | do notation. Receives a generator function and returns the result of said generator function. The generator will receive the `pure` function of the type do is called on. `yield`'ed monadic values return the inner value. This is sugar for chaining |

## Semigroup

Defines a set of values with a combination operation called concat. Requires the definition of identity and trivial cases if default implementations want to be used. Trivial implementation calls concat on the inner value. Identity implementation is the identity function. 

- Definitions: 
    - trivials: string[]
    - identities: string[]
- Overrides:
    - concat: object

| method | description |
| ------ | ----------- |
| concat :: Semigroup f => f a -> f b -> f c | combines two Semigroups |

## Monoid

A Monoid is a Semigroup with an identity element called zero. Defines aliases for concat.

- Definitions: 
    - trivials: string[]
    - identities: string[]
    - zero: string
- Overrides:
    - mappend: object
    - empty: object

| method | description | 
| ------ | ----------- |
| empty :: Monoid m => m a ~> () -> m b | returns the zero element |
| mappend :: Monoid m => m a ~> m b -> m c | alias of concat |
| append  :: Monoid m => m a ~> m b -> m c | alias of concat |

Also defines a function on the type 

| method | description | 
| ------ | ----------- |
| empty :: Monoid m => () -> m b | returns the zero element |
| accumulate :: Monoid m => [m a] => m a | reduces an array of Monoids into a single Monoid value |

## Show

Defines a type that has a string representation. The default implementation is `[Type => Variant Value]`. Keep in mind that since the representation uses the value, it will call get on the structure except for IO where it will only show `[IO => () => _]` to avoid running the computation

- Definitions: N/A
- Overrides:
    - show: object

| method | description |
| ------ | ----------- |
| show :: Show s => s a -> () -> String | returns string representation |
| toString :: Show s => s a -> () -> String | Alias of show |

## Swap

Swaps the context of the structure. Requires a left and right case. If called on a left, returns a right and vice versa, without changing the inner value. 

- Definitions: 
    - left: string
    - right: string
- Overrides:
    - swap: object

| method | description |
| ------ | ----------- |
| swap :: Swap s => s a ~> () -> s a | returns `left a` if the value is `right a` or `left a` if the value `right a` |

## Thenable

Defines a type that meets with the Thenable spec. This means it has a `then` method. It also provides a `toPromise` method that returns a promise that resolves on resolve cases and rejects on reject cases. Additionally, has a `catch` utility method.

- Definitions:
    - resolve: string[]
    - reject : string[]
- Overrides:
    - then
    - toPromise

| method | description |
| ------ | ----------- |
| then :: Thenable t => t a ~> (a -> undefined) -> (a -> undefined) -> undefined | calls first argument if resolve case. calls second argument if reject case |
| catch :: Thenable t => t a ~> (a -> undefined) -> undefined | calls argument if reject case |
| toPromise :: Thenable t => t a ~> ( ) -> Promise a | returns a promise that resolves on resolve case and rejects on reject case |

## Box

This is the base type of all structures. When creating a structure using the Union function, Box typeclass is implicitly implemented based on the tags of the union. It has no constructors and cannot be constructed directly. It has the following methods: 

| method | description |
| ------ | ----------- |
| get    :: Box a ~> () -> a   | returns the inner value of the strucure. |
| unwrap :: Box a ~> () -> * | breaks nested structures returning the inner most value. |
| match  :: Cases c, Box b => b a ~> c b a -> * | Matches the structure using the variant name. Cases type is just an object whose keys are the names for the possible cases of a given Box type (e.g. the cases of Maybe are "Just" and "None") and the values are functions that receive the boxed value as argument. |
| is\[variant] :: Box a ~> (a -> b) -> Boolean | *determines if a value is of type \[variant]. A method is generated for each variant in an union e.g. isJust, isNone |
| on\[variant] :: Box a ~> (a -> b) -> a \| b | *executes a function if value is of type \[variant]. A method is generated for each variant in an union e.g. onJust, onNone | 

\* These methods are not generated on unions with a single variant or unions created with the `noHelpers` flag

# Structures

## Maybe

``` 
Maybe<A> = Just<A> | None 
```

Maybe should be used when communicating the posibility of a falsy value is expected. The default behavior is that a falsy value maps to None and any other value maps to Just.

| constructor          | description                                 |
| -------------------- | ------------------------------------------- |
| Just :: a -> Just a  | Just constructor |
| None :: () -> None   | None constructor |
| of :: a -> Maybe a          | returns None on falsy value. Just otherwise |
| from :: a -> Maybe a          | returns None on falsy value. Just otherwise |
| fromFalsy :: a -> Maybe a     | returns None on falsy value. Just otherwise |
| fromArray :: [a] -> Maybe [a] | returns None on empty array. Just otherwise |
| fromNullish :: a -> Maybe a   | returns None on null or undefined. Just otherwise |
| fromEmpty :: a -> Maybe a     | returns None if the value provided is the empty value for the type. Just otherwise. Uses ramda's isEmpty function |
| fromPredicate :: (a -> Boolean) -> a -> Maybe a | returns Just if the predicate returns a truthy value. None otherwise. The second argument is used to evaluate the predicate and construct the Just. Equivalent to `Maybe.of(predicate(a)).map(() => a)` |
| isEmpty :: Maybe a -> Boolean | returns true on None. False otherwise |
| match :: (Cases a, Maybe b) => a -> b -> c | returns the result of evaluating the cases with the provided value |
| equals :: a -> b -> Boolean | returns whether two values are equal. Reference to ramda's equals function |

### Just and None

Just and None specific methods:

| method | description |
| ------ | ----------- |
| ifJust :: Maybe a ~> (a -> b) -> b \| Maybe a | returns the result of evaluating the given function if Just. Returns None otherwise |
| ifNone :: Maybe a ~> (a -> b) -> b \| Maybe a | returns the result of evaluating the given function if None. Returns (Just a) otherwise |
| filter :: Maybe a ~> (a -> Boolean) -> Maybe a | **override of filter**: if Just and predicate evaluate to false, returns None. Just otherwise |
| empty  :: Monoid m => Maybe m a ~> () -> Maybe (empty a) | **override of empty**: returns Just of the empty value of inner monoid |

Implements the following typeclasses:

- Functor
    - trivials: Just
    - identities: None
- Tap
    - trivials: Just
    - identities: None
- Monad
    - trivials: Just
    - identities: None
    - pure: Just
- Applicative
    - trivials: Just
    - identities: None
- Filterable 
    - trivials: Just
    - identities: None,
    - overrides: filter [ Just ]
- Show 
    - trivials: Just
    - identities: None
    - overrides: show [ None ]
- Thenable
    - resolve: [ Just ]
    - reject: [ None ]
- (Eq a) => Eq Maybe a
    - trivials: Just
    - empties: None
- (Semigroup a) => Semigroup Maybe a
    - trivials: Just
    - identities: None
- (Monoid a) => Monoid Maybe a
    - trivials: Just
    - identities: None
    - zero: None
    - overrides: empty [ Just ]

## Either

```
Either<A,B> = Left<A> | Right<B>
```

Either represents a value than can be of two possibilities (Left or Right). By convention, Left is used as the error case but this is not always the case. 

| type functions | description |
| -------------- | ----------- |
| of :: a -> Either a a | returns `Right a` if `a` is not undefined or null. Otherwise `Left a` |
| from :: a -> b -> Either a b | returns `Right b` if `b` is not undefined or null. Otherwise `Left a` |
| fromNullish :: a -> b -> Either a b | returns `Right b` if `b` is not undefined or null. Otherwise `Left a` |
| fromFalsy :: a -> b -> Either a b | returns `Right b` if `b` is truthy. Otherwise `Left a` |
| fromPredicate :: (a -> Boolean) -> a -> Either a a | returns `Right a` if the predicate returns true. Otherwise `Left a`. The second argument is optional and used to evaluate |
| fromMaybe :: Maybe m => m a -> Either a a | returns `Right a` if Just. Otherwise `Left undefined` |
| defaultTo :: a -> b -> Either a b | Curryed version of `of`. returns `Right b` if `b` is not undefined or null. Otherwise `Left a` |
| lefts :: Either f => [f a b] -> [f a b] | Receives an array of Eithers and returns an array of all the Eithers that where Left |
| rights :: Either f => [f a b] -> [f a b] | Receives an array of Eithers and returns an array of all the Eithers that where Right |
| partition :: Either f => [f a b] -> [[f a b],[f a b]] | Receives an array of Eithers and returns an array of arrays with the lefts on the first position and the rights on the second position |

### Left and Right 

| function | description |
| -------- | ----------- |
| ifRight  :: Either f => f a b ~> (a -> c) -> f c b | alias of `map` | 
| mapRight :: Either f => f a b ~> (a -> c) -> f c b | alias of `map` | 
| ifLeft   :: Either f => f a b ~> (b -> c) -> f a c | alias of `mapError` |
| mapLeft  :: Either f => f a b ~> (b -> c) -> f a c | alias of `mapError` |

Implements the following typeclasses: 

- Functor
- FunctorError
- Applicative
- Monad 
- Swap
- Show

Definitions for typeclasses:

- trivials: Right
- identities: Left
- pure: Right
- left: Left
- right: Right
- errors: Left

## IO

The Monad wraps a computation to be ran at a later point in time. Unlike other Monads, it is lazy and will not perform the computations unless `unsafeRun` is called. `map`, `show`, `apply` and `chain` are strict in their default implementations but IO provides lazy overrides for these operations by means of composition. The constructor expects a function but if a value is received, it will be wrapped in a function.

| methods | descriptions |
| ------- | ------------ |
| unsafeRun :: IO f => f a ~> () -> a | runs the computation |


## Sum, Mult, Merge

These three are Monoids. Sum and Mult are Monoids of numbers under addition and multiplication respectively (using 0 and 1 as their respective identities). Merge is the Monoid for objects under the merge operation (using empty object "{}" as the identity). 

```
Sum<A> = Sum<A> | Zero
Mult<A> = Mult<A> | One
Merge<A> = Merge<A> | Empty
```

All three types have exactly four constructors: The two cases, `of` and `from`.

They all trivialy implement the following typeclasses:

- Eq
    - trivials: All cases
- Semigroup
- Monoid
- Functor
- Applicative
- Monad
- Show

Definitions for all other typeclasses:
- pure: Sum, Mult, Merge 
- zero: Zero, One, Empty 
- trivials: Sum, Mult, Merge 
- identities: Zero, One, Empty 

They all override the concat function. Sum uses addition, Mult uses multiplication and Merge uses the merge operation.

## Reader

Reader monad is used to supply a common value to a group of functions. It is lazy and is very similar to `IO`: Like `IO` this structures provides lazy overrides for the Functor, Applicative and Monad methods. Unlike `IO` arguments passed to `unsafeRun` are passed to the inner computation.

| methods | descriptions |
| ------- | ------------ |
| local :: Reader r => r a b ~> (a -> c) -> r c b | transforms the enviroment before passing it to the computaions using the given function. |

It also provides `runReader` to run a reader and a `ask` constructor that returns `Reader.of(x => x)`
