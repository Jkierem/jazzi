import { BoxedBase } from "./boxImpls"
import { AnyFn } from "./types"

const Mixer = <A>(a: A) => {
    return {
        mix: <B>(fn: (a: A) => B) => Mixer(fn(a)),
        mixWith: <B>(b: B) => Mixer({...a, ...b}),
        finish: () => a
    }
}

export const alias = <T extends { [P:string] : AnyFn } , K extends keyof T>(key: K) => function(this: T, ...args: Parameters<T[K]>): ReturnType<T[K]>{
    return this[key](...args)
}

export const Builder = <
    TName extends string,
    Cases extends string,
>(tname: TName, cases: readonly Cases[]) => {
    return {
        forVariant<VName extends Cases, Inner>(vname: VName, inner: Inner){
            return Mixer(BoxedBase(tname, cases, vname, inner))
        }
    }
}