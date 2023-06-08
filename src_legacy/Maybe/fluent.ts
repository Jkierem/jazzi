import { getVariant } from "../_internals/symbols"
import * as M from "./index"

const Operators = [ 
    "isJust", "isNone", "get", "fold", "match", 
    "show", "map", "chain", "tap", "mapTo", 
    "zipWith", "zip", "zipLeft", "zipRight", 
    "toPromise", "toAsync",
    "unwrap"
]

interface MaybeFluent<A> {
    isJust(): boolean
    isNone(): boolean
    get(): A | undefined
    fold<L,R>(onNone: () => L, onJust: (data: A) => R): L | R
    match<B,C>(pattern: M.Pattern<A,B,C>): B | C
    show(): string
    map<B>(fn: (a: A) => B): MaybeFluent<B>
    chain<B>(fn: (a: A) => MaybeFluent<B>): MaybeFluent<B>

    tap(fn: (a: A) => void): MaybeFluent<A>
    mapTo<B>(constant: B): MaybeFluent<B>

    zipWith<B,C>(other: MaybeFluent<B>, fn: (a: A, b: B) => C): MaybeFluent<C>
    zip<B>(other: MaybeFluent<B>): MaybeFluent<[A,B]>
    zipLeft<B>(other: MaybeFluent<B>): MaybeFluent<A>
    zipRight<B>(other: MaybeFluent<B>): MaybeFluent<B>

    toPromise(): Promise<Awaited<A>>

    /**
     * Returns the internal Maybe instance
     */
    unwrap(): M.Maybe<A>

    /** TODO implement */
    toAsync(): any
    toEither(): any
}

const fluent = <T>(m: M.Maybe<T>) => {
    return new Proxy(m as unknown as MaybeFluent<T>, {
        get<P extends keyof MaybeFluent<T>>(target: any, p: P): any {
            if( Operators.includes(p) ){
                type Fn = MaybeFluent<T>[P]

                if( p === "chain" ){
                    return <B>(fn: (a: T) => MaybeFluent<B>) => {
                        const adapted = (a: T) => fn(a).unwrap()
                        return fluent(target['|>'](M.chain(adapted)));
                    }
                }

                if( p === "unwrap" ){
                    return () => target
                }

                if( p === "zipWith" ){
                    return <B,C>(other: MaybeFluent<B>, fn: (a: T, b: B) => C ) => {
                        return fluent(target["|>"](M.zipWith(fn)(other.unwrap())))
                    }
                }

                if( ["zip", "zipLeft", "zipRight"].includes(p) ){
                    return <B>(other: MaybeFluent<B>) => {
                        return fluent(target['|>']((M as any)[p](other.unwrap())));
                    }
                }

                return (...args: Parameters<Fn>) => {
                    const result: unknown = target["|>"]((M as any)[p](...args));
                    if(["Just", "None"].includes(getVariant(result) as unknown as string)){
                        return fluent(result as any)
                    }
                    return result;
                }
            }
            return undefined;
        },
        has(_, p: keyof MaybeFluent<T>) {
            return Operators.includes(p)
        },
        isExtensible(){ 
            return false 
        },
    })
}

export function Just<A>(a: A){
    return fluent(M.Just(a))
}

export function None<A>(){
    return fluent(M.None<A>());
}

export function of<A>(a: A){
    return fluent(M.of(a));
}

export function from<A>(a: A){
    return fluent(M.from(a));
}

export function fromFalsy<A>(a: A){
    return fluent(M.fromFalsy(a));
}

export function fromEmpty<A>(a: A[]){
    return fluent(M.fromEmpty(a));
}

export function fromCondition<A>(fn: (a: A) => boolean){
    return (a: A) => fn(a) ? Just(a) : None<A>();
}

export function fromBoolean(val: boolean){
    return fromCondition<boolean>(Boolean)(val)
}