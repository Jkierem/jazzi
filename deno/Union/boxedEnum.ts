import { forEachValue, isNil } from "../_internals/mod.ts";
import { getVariant, setTypeclass } from "../_internals/symbols.ts";
import { AnyConstRec, Boxed } from "../_internals/types.ts";
import { Enum } from "./enum.ts";
import { Eq } from "./eq.ts";
import { Functor } from "./functor.ts";
import { Ord } from "./ord.ts";
import { Show } from "./show.ts";

const mark = setTypeclass("BoxedEnum")

export interface BoxedEnum<A, TRep, Cases extends string> 
extends Boxed<A,TRep,Cases>, Eq, Ord, Enum, Show, Functor<A> {
    map<B>(fn: (a: A) => B ): BoxedEnum<B,TRep,Cases>;
    fmap<B>(fn: (a: A) => B ): BoxedEnum<B,TRep,Cases>;
    mapTo<B>(b: B): BoxedEnum<B,TRep,Cases>;
    succ(): BoxedEnum<undefined,TRep,Cases> | undefined;
    pred(): BoxedEnum<undefined,TRep,Cases> | undefined;
    /**
     * Returns the succesor, maintaining the inner value, if it exists.
     */
    next(): BoxedEnum<A,TRep,Cases> | undefined;
    /**
     * Returns the predecessor, maintaining the inner value, if it exists.
     */
    prev(): BoxedEnum<A,TRep,Cases> | undefined;
    getVariant(): Cases;
    getTag(): Cases;
}

export interface BoxedEnumRep<Cases extends string> {
    /**
     * Returns the succesor of the given BoxedEnum, maintaining the inner value, if it exists.
     * @param b 
     */
    next<A>(b: BoxedEnum<A,BoxedEnumRep<Cases>,Cases>): BoxedEnum<A,BoxedEnumRep<Cases>,Cases> | undefined;
    /**
     * Returns the predecessor of the given BoxedEnum, maintaining the inner value, if it exists.
     * @param b 
     */
    prev<A>(b: BoxedEnum<A,BoxedEnumRep<Cases>,Cases>): BoxedEnum<A,BoxedEnumRep<Cases>,Cases> | undefined;
}

/**
 * Adds the next and previous methods to proto and global. 
 * Requires Functor and Enum
 */
const BoxedEnum = () => mark((cases: AnyConstRec, globals: any) => {
    function next(this: BoxedEnum<any,any,any>){
        const val = this.get();
        const suc = this.succ?.();
        return isNil(suc) ? undefined : suc.map(() => val);
    }

    function prev(this: BoxedEnum<any,any,any>){
        const val = this.get();
        const pre = this.pred?.();
        return isNil(pre) ? undefined : pre.map(() => val);
    }

    function getTag(this: BoxedEnum<any,any,any>){
        return getVariant(this)
    }

    forEachValue((c) => {
        c.prototype.next = next;
        c.prototype.prev = prev;
        c.prototype.getTag = getTag;
        c.prototype.getVariant = getTag;
    }, cases)
    
    globals.next = (x: BoxedEnum<any,any,any>) => x.next();
    globals.prev = (x: BoxedEnum<any,any,any>) => x.prev();
})

mark(BoxedEnum)

export default BoxedEnum