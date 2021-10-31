import * as U from '../Union'
import { createAutoDefinition } from '../Union';
import { hasInstance } from '../_tools';
import { Spy } from '../__test-utils/index'

const AutoType = U.AutoType

const AutoExtendable = [
    U.Applicative,
    U.Bifunctor,
    U.BoxedEnum,
    U.Enum,
    U.Eq,
    U.Filterable,
    U.Foldable,
    U.Functor,
    U.Monad,
    U.Ord,
    U.Semigroup,
    U.Show,
    U.Tap,
    U.Thenable,
]

describe("AutoType", () => {
    it("should be able to auto implement these type classes", () => {
        const Auto = AutoType("Auto",AutoExtendable);
        const auto = Auto.of(42)
        expect(hasInstance(U.Applicative, auto)).toBeTruthy()
        expect(hasInstance(U.Bifunctor, auto)).toBeTruthy()
        expect(hasInstance(U.BoxedEnum, auto)).toBeTruthy()
        expect(hasInstance(U.Enum, auto)).toBeTruthy()
        expect(hasInstance(U.Eq, auto)).toBeTruthy()
        expect(hasInstance(U.Filterable, auto)).toBeTruthy()
        expect(hasInstance(U.Foldable, auto)).toBeTruthy()
        expect(hasInstance(U.Functor, auto)).toBeTruthy()
        expect(hasInstance(U.Monad, auto)).toBeTruthy()
        expect(hasInstance(U.Ord, auto)).toBeTruthy()
        expect(hasInstance(U.Semigroup, auto)).toBeTruthy()
        expect(hasInstance(U.Show, auto)).toBeTruthy()
        expect(hasInstance(U.Tap, auto)).toBeTruthy()
        expect(hasInstance(U.Thenable, auto)).toBeTruthy()
    })
    it("should pass autoconfig to all typeclasses", () => {
        const spy = Spy(U.Functor)
        const Auto = AutoType("Auto",[spy]);
        const autoDef = createAutoDefinition("Auto")
        expect(spy.calledOnce).toBeTruthy()
        expect(JSON.stringify(spy.calls[0].args[0])).toBe(JSON.stringify(autoDef))
        expect(hasInstance(U.Functor,Auto.of(42))).toBeTruthy()
    })
})