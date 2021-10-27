export { default as Applicative } from "./applicative.ts";
export { default as BoxedEnum } from "./boxedEnum.ts";
export { default as BoxedEnumType } from "./boxedEnumType.ts";
export { default as EnumType } from "./enumType.ts";
export { default as Enum } from "./enum.ts";
export { default as Eq } from "./eq.ts";
export { default as Filterable } from "./filterable.ts";
export { default as Foldable } from "./foldable.ts";
export { default as Functor } from "./functor.ts";
export { default as Monad } from "./monad.ts";
export { default as Monoid } from "./monoid.ts";
export { default as Natural } from "./natural.ts";
export { default as Ord } from "./ord.ts";
export { default as Semigroup } from "./semigroup.ts";
export { default as Show } from "./show.ts";
export { default as Swap } from "./swap.ts";
export { default as Tap } from "./tap.ts";
export { default as Thenable } from "./thenable.ts";
import { default as _RawUnion } from "./union.ts";

type UnionDefinition = {
  name: string
  cases: {
    [x: string]: (innerValue: any) => any
  }
  extensions?: any[]
  config?: {
    noHelpers?: boolean
  }
  constructors?: {
    [x: string]: (x: any) => any
  }
}
/**
 * Creates an union type
 */
export const Union = (data: UnionDefinition) => {
  const { name, cases, extensions=[], config={}, constructors={} } = data;
  return _RawUnion(name, cases, extensions, config).constructors(constructors);
}
export * from "./functor.ts";
export { AutoType, NewType, createAutoDefinition } from "./union.ts";
export { Ordering } from "./ord.ts";
