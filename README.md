# Ramda Structures

Implementations of common structures using ramda for utilities. ~~No inheritance. Just plain objects~~ Now with inheritance!

- Maybe
- Result
- ~~Try (was the same as Result)~~

All structures share a common set of functions to be used. In terms of nomenclature, all constructor functions start with "from". All structures have a default "from" that marks the most common use of the structure. They all have a "match" function that is case-insensitive to make matches. Due to the use of objects for matching, Order of cases does not alter the result. Matching has two reserved keys for default cases: "default" and "_"(underscore). "default" precedes over underscore and a matching type precedes over default cases.
The function signature notation used is similar to haskell's type notations with a little more information: for object method calls, the type of the object is given using the "~>" as seen in this example:

```javascript
// "~>" used to define the object's type
// This means map must be called on an array object
// and that the object is an array of a's
// map :: [a] ~> (a -> b) -> [b]
[1,2,3].map(() => 42)

// "=>" type constraints are always before the implicit object
// match :: Cases b => Maybe a ~> b -> c
// This means that b" is of type "Cases" and 
// "match" is a method of a "Maybe" object 
```

## Maybe

``` 
Maybe<A> = Just<A> | None 
```

Maybe should be used when communicating the posibility of a falsy value is expected. The default behavior is that a falsy value maps to None and any other value maps to Just.

| constructor          | description                                 |
| -------------------- | ------------------------------------------- |
| Just :: a -> Just a  | Just constructor |
| None :: () -> None   | None constructor |
| from :: a -> Maybe a          | returns None on falsy value. Just otherwise |
| fromFalsy :: a -> Maybe a     | returns None on falsy value. Just otherwise |
| fromArray :: [a] -> Maybe [a] | returns None on empty array. Just otherwise |
| fromNullish :: a -> Maybe a   | returns None on null or undefined. Just otherwise |
| fromEmpty :: a -> Maybe a     | returns None if the value provided is the empty value for the type. Just otherwise. Uses ramda's isEmpty function |
| fromPredicate :: (a -> Boolean) -> a -> Maybe a | returns Just if the predicate returns a truthy value. None otherwise. The second argument is used to evaluate the predicate |
| fromTry :: Try a => a -> Maybe a | returns Just on a Success. None on a Failure |
| fromResult :: Result a => a -> Maybe a | returns Just on a Ok. None on a Err |
| isEmpty :: Maybe a -> Boolean | returns true on None. False otherwise |
| match :: (Cases a, Maybe b) => a -> b -> c | returns the result of evaluating the cases with the provided value |
| equals :: a -> b -> Boolean | returns whether two values are equal. Reference to ramda's equals function |

### Just and None

these are the methods that Just and None have defined.

| method | description |
| ------ | ----------- |
| match :: Cases a => Maybe b ~> a -> c | returns the result of evaluating the cases with the called object |
| get :: Maybe a ~> () -> a | returns the inner value. For None, the inner value is undefined |
| map :: Maybe a ~> (a -> b) -> Maybe b | returns Just of the mapped value if called on a Just. None otherwise | 
| effect :: Maybe a ~> (a -> any) -> Maybe a | calls the provided function with the inner value and returns the same object if it is a Just. Does nothing otherwise |
| chain :: Maybe a ~> (a -> b) -> b | Call the received function with the inner value |
| equals :: Maybe a ~> b -> Boolean | Tests equality. Two Just are equal if their inner values are equal. Two Nones are always equal |
| onNone :: Maybe a ~> ( (() -> b) \| c) -> a \| b \| c | This function returns the inner value when the object is a Just. Otherwise either calls the provided function and returns it's result or in the case a value was provided, returns said value |
| isJust :: Maybe a ~> () -> Boolean | returns true if it is a Just. False otherwise |
| isNone :: Maybe a ~> () -> Boolean | returns true if it is a None. False otherwise |
| empty :: Maybe a ~> () -> None | return the empty value for the type. Always None |

## Result

```
Result<A,B> = Ok<A> | Err<B>
```

Result marks the possibility of an Error. The default constructor returns Err when the received value is an Error and Ok otherwise.

| constructor          | description                                 |
| -------------------- | ------------------------------------------- |
| Ok :: a -> Ok a      | Ok constructor |
| Err :: a -> Err a    | Err constructor |
| from :: a -> Result a         | returns Err on Error Object. Ok otherwise |
| fromError :: a -> Result a    | returns Err on Error Object. Ok otherwise |
| fromFalsy :: a -> Result a     | returns Err on falsy value. Ok otherwise  |
| fromPredicate :: (a -> Boolean) -> a -> Result a | returns Ok if the predicate returns a truthy value. Err otherwise. The second argument is used to evaluate the predicate |
| fromTry :: Try a => a -> Result a | returns Ok on a Success. Err on a Failure |
| fromMaybe :: Maybe a => a -> Result a | returns Ok on a Just. Err of undefined on a None |
| attempt :: (() -> a) -> Result a | returns Ok if the functions returns. Err if the function throws |
| match :: (Cases a, Result b) => a -> b -> c | returns the result of evaluating the cases with the provided value |
| equals :: a -> b -> Boolean | returns whether two values are equal. Reference to ramda's equals function |

### Ok and Err

| method | description |
| ------ | ----------- |
| match :: Cases a => Result b ~> a -> c | returns the result of evaluating the cases with the called object |
| get :: Result a ~> () -> a | returns the inner value. |
| map :: Result a ~> (a -> b) -> Result b | returns Ok of the mapped value if called on a Ok. Does nothing otherwise | 
| effect :: Result a ~> (a -> any) -> Result a | calls the provided function with the inner value and returns the same object if it is a Ok. Does nothing otherwise |
| chain :: Result a ~> (a -> b) -> b | Call the received function with the inner value if Ok. Returns the same object otherwise |
| equals :: Result a ~> b -> Boolean | Tests equality. Two Results are equal if their inner values are equal. |
| onErr :: Result a ~> ( (() -> b) \| c) -> a \| b \| c | This function returns the inner value when the object is a Ok. Otherwise either calls the provided function and returns it's result or in the case a value was provided, returns said value |
| isOk :: Result a ~> () -> Boolean | returns true if it is a Ok. False otherwise |
| isErr :: Result a ~> () -> Boolean | returns true if it is a Err. False otherwise |