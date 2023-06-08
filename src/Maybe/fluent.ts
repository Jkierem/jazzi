import * as M from "./index"

const fluent = <T>(m: T) => ({})

export class MaybeFluent<A> {
    private constructor(private inner: M.Maybe<A>){}

    static Just<A>(a: A){
        return new MaybeFluent<A>(M.Just(a));
    }

    static None<A>(){
        return new MaybeFluent<A>(M.None<A>());
    }

    static of<A>(a: A){
        return new MaybeFluent<A>(M.of(a));
    }

    static from<A>(a: A){
        return new MaybeFluent<A>(M.from(a));
    }

    static fromFalsy<A>(a: A){
        return new MaybeFluent<A>(M.fromFalsy(a));
    }

    static fromEmpty<A>(a: A[]){
        return new MaybeFluent<A[]>(M.fromEmpty(a));
    }

    static fromCondition<A>(fn: (a: A) => boolean){
        return (a: A) => fn(a) ? MaybeFluent.Just(a) : MaybeFluent.None<A>();
    }

    isNone(){
        return M.isNone(this.inner);
    }

    isJust(){
        return M.isJust(this.inner);
    }

    get(){
        return M.get(this.inner);
    }

    fold<B,C>(onNone: () => B, onJust: (data: A) => C){
        return M.fold(onNone, onJust)(this.inner);
    }

    match<B,C>(pattern: { Just: (a: A) => B, None: () => C }){
        return M.match(pattern)(this.inner);
    }

    show(){
        return M.show(this.inner);
    }

    map<B>(fn: (a: A) => B){
        return new MaybeFluent<B>(M.map(fn)(this.inner));
    }

    chain<B>(fn: (a: A) => MaybeFluent<B>){
        return new MaybeFluent<B>(M.chain((a: A) => fn(a).inner)(this.inner));
    }

    tap(fn: (a: A) => void){
        return new MaybeFluent<A>(M.tap(fn)(this.inner));
    }

    mapTo<B>(c: B){
        return this.map(() => c);
    }

    zipWith<B,C>(other: MaybeFluent<B>, fn: (a: A, b: B) => C): MaybeFluent<C> {
        return this.chain(x => other.map(y => fn(x,y)))
    }

    zip<B>(other: MaybeFluent<B>): MaybeFluent<[A,B]>{
        return this.zipWith(other, (a,b) => [a,b] as [A,B])
    }

    zipLeft<B>(other: MaybeFluent<B>){
        return this.zip(other).map(([a]) => a);
    }

    zipRight<B>(other: MaybeFluent<B>){
        return this.zip(other).map(([_,b]) => b);
    }

    toPromise(){
        return M.toPromise(this.inner);
    }

    unwrap(){
        return this.inner;
    }

    /** TODO: implement */
    toAsync(){
        return;
    }
}