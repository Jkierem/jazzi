import { forEachValue, isNil, setTypeclass } from "../_internals";

const mark = x => setTypeclass("BoxedEnum",x)

/**
 * Adds the next and previous methods. 
 * Requires Functor and Enum
 */
const BoxedEnum = () => mark((cases,globals) => {
    function next(){
        const val = this.get();
        const suc = this.succ?.();
        return isNil(suc) ? undefined : suc.map(() => val);
    }

    function previous(){
        const val = this.get();
        const pre = this.pred?.();
        return isNil(pre) ? undefined : pre.map(() => val);
    }

    forEachValue((c) => {
        c.prototype.next = next;
        c.prototype.previous = previous
    }, cases)
    
    globals.next = x => x.next();
    globals.previous = x => x.previous();
})

mark(BoxedEnum)

export default BoxedEnum