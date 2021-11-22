export { default as Applicative } from "./applicative.ts";
export { default as BoxedEnum, BoxedEnumRep } from "./boxedEnum.ts";
export { default as BoxedEnumType, BoxedEnumTypeRep } from "./boxedEnumType.ts";

export { default as EnumType, EnumValue, EnumTypeRep } from "./enumType.ts";
export { default as Enum, EnumRep } from "./enum.ts";
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
export { default as Traversable } from "./traversable.ts";
export { default as Runnable } from "./runnable.ts";

import type { BoxedEnum, BoxedEnumRep } from "./boxedEnum.ts";
import type { BoxedEnumTypeRep } from "./boxedEnumType.ts";

import type { EnumValue, EnumTypeRep } from "./enumType.ts";
import type { Boxed, Matcher, MatcherRep } from "../_internals/types.ts";
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

export type TagOf<Type> =
  Type extends Boxed<any,any,infer Cases>     ? Cases :
  Type extends EnumValue<infer Cases>         ? Cases :
  Type extends EnumTypeRep<infer Cases>       ? Cases :
  Type extends BoxedEnum<any,any,infer Cases> ? Cases :
  Type extends BoxedEnumRep<infer Cases>      ? Cases :
  Type extends BoxedEnumTypeRep<infer Cases>  ? Cases :
  Type extends Matcher<infer Cases>           ? Cases :
  Type extends MatcherRep<infer Cases>        ? Cases :
  never

export type VariantOf<Type> = TagOf<Type>