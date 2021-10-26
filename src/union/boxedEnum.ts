import { forEachValue, isNil } from "../_internals";
import { setTypeclass } from "../_internals/symbols";
import { AnyConstRec, Boxed } from "../_internals/types";
import { Enum } from "./enum";
import { Eq } from "./eq";
import { Functor } from "./functor";
import { Ord } from "./ord";
import { Show } from "./show";

const mark = setTypeclass("BoxedEnum")

export interface BoxedEnum<A> 
extends Boxed<A>, Eq, Ord, Enum, Show, Functor<A> {
    map<B>(fn: (a: A) => B ): BoxedEnum<B>;
    fmap<B>(fn: (a: A) => B ): BoxedEnum<B>;
    mapTo<B>(b: B): BoxedEnum<B>;
    succ(): BoxedEnum<undefined> | undefined;
    pred(): BoxedEnum<undefined> | undefined;
    /**
     * Returns the succesor, maintaining the inner value, if it exists.
     */
    next(): BoxedEnum<A> | undefined;
    /**
     * Returns the predecessor, maintaining the inner value, if it exists.
     */
    prev(): BoxedEnum<A> | undefined;
}

export interface BoxedEnumRep {
    /**
     * Returns the succesor of the given BoxedEnum, maintaining the inner value, if it exists.
     * @param b 
     */
    next<A>(b: BoxedEnum<A>): BoxedEnum<A> | undefined;
    /**
     * Returns the predecessor of the given BoxedEnum, maintaining the inner value, if it exists.
     * @param b 
     */
    prev<A>(b: BoxedEnum<A>): BoxedEnum<A> | undefined;
}

/**
 * Adds the next and previous methods to proto and global. 
 * Requires Functor and Enum
 */
const BoxedEnum = () => mark((cases: AnyConstRec, globals: any) => {
    function next(this: BoxedEnum<any>){
        const val = this.get();
        const suc = this.succ?.();
        return isNil(suc) ? undefined : suc.map(() => val);
    }

    function prev(this: BoxedEnum<any>){
        const val = this.get();
        const pre = this.pred?.();
        return isNil(pre) ? undefined : pre.map(() => val);
    }

    forEachValue((c) => {
        c.prototype.next = next;
        c.prototype.prev = prev;
    }, cases)
    
    globals.next = (x: BoxedEnum<any>) => x.next();
    globals.prev = (x: BoxedEnum<any>) => x.prev();
})

mark(BoxedEnum)

export default BoxedEnum