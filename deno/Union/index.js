export { default as Applicative } from "./applicative.js";
export { default as Bifunctor } from "./bifunctor.js";
export { default as BoxedEnum } from "./boxedEnum.js";
export { default as BoxedEnumType } from "./boxedEnumType.js";
export { default as Effect } from "./effect.js";
export { default as EnumType } from "./enumType.js";
export { default as Enum } from "./enum.js";
export { default as Eq } from "./eq.js";
export { default as Filterable } from "./filterable.js";
export { default as Foldable } from "./foldable.js";
export { default as Functor } from "./functor.js";
export { default as Monad } from "./monad.js";
export { default as Monoid } from "./monoid.js";
export { default as Ord } from "./ord.js";
export { default as Semigroup } from "./semigroup.js";
export { default as Show } from "./show.js";
export { default as Swap } from "./swap.js";
export { default as Thenable } from "./thenable.js";

import { default as _RawUnion } from "./union.js";

/**
 * 
 * @param {{
 *  name: string
 *  cases: {
 *    [x: string]: (innerValue: any) => any
 *  }
 *  extensions: any[]
 *  config: {
 *    noHelpers: boolean
 *  }
 *  constructors: {
 *    [x: string]: (x: any) => any
 *  }
 * }} data union definition data
 */
export const Union = (data) => {
  const { name, cases, extensions=[], config={}, constructors={} } = data;
  return _RawUnion(name, cases, extensions, config).constructors(constructors);
}
export * from "./functor.js";
export * from "./union.js";
export * from "./ord.js";
