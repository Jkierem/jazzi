import { BoxedBase } from "./boxImpls"

const Mixer = <A>(a: A) => {
    return {
        mix: <B>(fn: (a: A) => B) => Mixer(fn(a)),
        finish: () => a
    }
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