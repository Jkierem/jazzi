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
// "c m a" is Cases of a Maybe of a type "a"
// "*" just means "any type"
```


# Typeclasses

This library implements typeclasses as functions that alter the prototype of the cases of a given union. The functions receive an object with their definitions and return a function that receives the cases and alters their prototype. Cases are the equivalent to data constructors or at least in this library. The word "variant" is used as a synomin to "case". In general, a `trivial` case is one that uses the default implementation, an `identity` case is one that either does nothing or that returns its argument and a `empty` case is one that does not need the inner value to excecute the operation. `overrides` are cases that have their own implementation. The following typeclasses are available:

## Applicative

Defines a structure that can apply its inner value to the inner value of another applicative. A type that implements this typeclass has to define a list of trivial cases and a list of identity cases. Defines the following method:

| method | description |
| ------ | ----------- |
| apply :: Applicative f => f a ~> f (a -> b) -> f b | applies the inner value of the structure to the inner value of the received structure if the applicative is a case with a definition of apply or if it is a trivial case. If the applicative being called is an identity, it simply returns itself without a change |

## Functor

Defines a structure that can be mapped over a given function without leaving the context of the functor meaning that the map operation always returns the same type variant and remains in the same context. Requires the definition of trivial cases and identity cases if the default implementation wants to be used. 

| method | description |
| ------ | ----------- |
| map :: Functor f => f a ~> (a -> b) -> f b | if trivial case, maps the functor over the given function. If it is an identity case does nothing |
| fmap :: Functor f => f a ~> (a -> b) -> f b | alias of map

## FunctorError

Defines a mapError operation that behaves like map but maps over the error cases and all other cases behave like an identity. It is a way to handle error cases and map them. Although it does not need to be a functor, it is implied and suggested.

| method | description |
| ------ | ----------- |
| mapError :: FunctorError f => f a ~> (a -> b) -> f b | if error case, maps the functor over the given function. Otherwise does nothing |

## Bifunctor

Defines a bimap method for a structure that has a defined first and second cases.

| method | description |
|--------|-------------|
| bimap :: Bifunctor (a | c) ~> (a -> b) -> (c -> d) -> Bifunctor (b \| d) | maps using the first function if first, second function if second. |

## Effect

This typeclass defines a way to look into a structure without altering it. Usually runs tasks considered as side effects hence the name. It requires the definition of trivial cases and identity cases if the default implementation wants to be used.

| method | description |
| ------ | ----------- |
| effect :: Effect f => f a ~> (a -> ()) -> f a | runs the given function without altering the structure if trivial. Does nothing if identity |
| peak   :: Effect f => f a ~> (a -> ()) -> f a | alias of effect |

## Eq

Defines equality for a structure. Needs to have the trivial and empty definitions if the default implementation wants to be used. For trivials, it compares variant and inner value with deep equality. For empty cases, only compares variant since empty cases have no inner value.

| method | description |
| ------ | ----------- |
| equals :: Eq a ~> Eq b -> Boolean | checks for equality |

Also defines a method on the type:

| method | description |
| ------ | ----------- |
| equals :: Eq a -> Eq b -> Boolean | check for equality calling equals method on the first argument |

## Filterable

Defines a type than can be filtered. The trivial case implementation calls filter on the inner value. The identity case returns the same structure unchanged

| method | description |
| ------ | ----------- |
| filter :: Filterable f => f a ~> (a -> Boolean) -> f a | filters the structure |

## Foldable

Defines a type that has a fold method. There is no default implementation. Must be implemented.

| method | description |
| fold :: Foldable f => f a -> (a -> b -> b) -> b | folds the structure. Result is a special case of folds |

## Monad

Defines a monadic type with a pure and a chain method. Like other typeclasses, needs the definitions of trivial and identity cases. Trivial chain case returns the value of evaluating the given function. Identity chain cases do nothing and return the structure unchanged. Requires to have a pure case defined.

| method | description |
| ------ | ----------- |
| chain :: Monad m => m a ~> (a -> m b) -> m b | calls the provided function with the inner value. Expects the function to return a Monad of the same type |
| bind :: Monad m => m a ~> (a -> m b) -> m b | alias of chain |
| flatMap :: Monad m => m a ~> (a -> m b) -> m b | alias of chain |

Also defines a method on the type 

| method | description |
| ------ | ----------- |
| pure :: a -> m a | constructs a monadic value |

## Semigroup

Defines a set of values with a combination operation called concat. Requires the definition of identity and trivial cases if default implementations want to be used. Trivial implementation calls concat on the inner value. Identity implementation is the identity function. 

| method | description |
| ------ | ----------- |
| concat :: Semigroup f => f a -> f b -> f c | combines two Semigroups |

## Monoid

A Monoid is a Semigroup with an identity element called zero. Defines aliases for concat. 

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

| method | description |
| ------ | ----------- |
| show :: Show s => s a -> () -> String | returns string representation |
| toString :: Show s => s a -> () -> String | Alias of show |

## Swap

Swaps the context of the structure. Requires a left and right case. If called on a left, returns a right and vice versa, without changing the inner value. 

| method | description |
| swap :: Swap s => s a ~> () -> s a | returns `left a` if the value is `right a` or `left a` if the value `right a` |

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
| fromResult :: Result a => a -> Maybe a | returns Just on a Ok. None on a Err |
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
- Effect
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
| of :: a -> b -> Either a b | returns `Right b` if `b` is not undefined or null. Otherwise `Left a` |
| from :: a -> b -> Either a b | returns `Right b` if `b` is not undefined or null. Otherwise `Left a` |
| fromNullish :: a -> b -> Either a b | returns `Right b` if `b` is not undefined or null. Otherwise `Left a` |
| fromFalsy :: a -> b -> Either a b | returns `Right b` if `b` is truthy. Otherwise `Left a` |
| fromPredicate :: (a -> Boolean) -> a -> Either a a | returns `Right a` if the predicate returns true. Otherwise `Left a`. The second argument is optional and used to evaluate |
| fromMaybe :: Maybe m => m a -> Either a a | returns `Right a` if Just. Otherwise `Left undefined` |
| fromResult :: Result m => m a b -> Either a b | returns `Right a` if Ok. Otherwise `Left b` |
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

## Result

```
Result<A,B> = Ok<A> | Err<B>
```

Result marks the possibility of an Error. The default constructor returns Err when the received value throws an Error and Ok of the evaluation otherwise. Result can be seen as an opinionated case of Either. Also, a Result may have a fold operation but since it is so different from the Foldable definition, it does not implement the typeclass.

| type functions       | description                                 |
| -------------------- | ------------------------------------------- |
| Ok :: a -> Ok a      | Ok constructor |
| Err :: a -> Err a    | Err constructor |
| of :: (() -> a) -> Result a   | returns Err on thrown Error. Ok otherwise |
| from :: (() -> a) -> Result a | returns Err on thrown Error. Ok otherwise |
| fromError :: a -> Result a    | returns Err on Error Object. Ok otherwise |
| fromFalsy :: a -> Result a    | returns Err on falsy value. Ok otherwise  |
| fromPredicate :: (a -> Boolean) -> a -> Result a | returns Ok if the predicate returns a truthy value. Err otherwise. The second argument is used to evaluate the predicate and to construct the Result. Equivalent to `Result.fromFalsy(predicate(a)).map(() => a).mapEror(() => a)` |
| fromMaybe :: Maybe a => a -> Result a | returns Ok on a Just. Err of undefined on a None |
| fromEither :: Either f => f a b -> Result a b | returns Ok on a Right. Err on a Left |
| attempt :: (() -> a) -> Result a | returns Ok if the functions returns. Err if the function throws |

### Ok and Err

| method | description |
| ------ | ----------- |
| fold :: Result f => f a b ~> (a -> c) -> (b -> d) -> b \| d | returns the evaluation of the first function with the inner value as ar |
gument if `Err`. Returns the evaluation of the second function with the inner value if `Right` |
| filter :: Result f => f a b ~> (a -> Boolean) -> f a b | **override of filter**: if it is `Ok a` and the predicate returns false, returns `Err a`. Otherwise returns the structure unchanged |

Implements the following typeclasses: 

- Bifunctor
    
- Effect
- Filterable
- Eq
- Functor
- FunctorError
- Applicative
- Monad
- Swap
- Show

Definitions for typeclasses:

- first: Ok
- second: Err
- pure: Ok
- right: Ok
- left: Err
- errors: Err
- trivials: Ok
- identities: Err
- overrides: 
    - filter: Ok
    - equals: Err

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

Reader monad is used to supply a common value to a group of functions. 

## Sink

The Sink monad is used to accumulate a monoid value over a group of functions.  