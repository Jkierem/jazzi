export type Functor<Ret,A> = {
    map: <B>(fn: (a: A) => B) => Ret
}