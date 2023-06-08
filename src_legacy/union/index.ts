export { default as Applicative } from "./applicative";
export { default as BoxedEnum } from "./boxedEnum";
export type { BoxedEnumRep } from "./boxedEnum";
export { default as BoxedEnumType } from "./boxedEnumType"; 
export type { BoxedEnumTypeRep } from "./boxedEnumType";
export { default as EnumType } from "./enumType";
export type { EnumValue, EnumTypeRep } from "./enumType";
export { default as Enum } from "./enum";
export type { EnumRep } from './enum';
export { default as Eq } from "./eq";
export { default as Filterable } from "./filterable";
export { default as Foldable } from "./foldable";
export { default as Functor } from "./functor";
export { default as Monad } from "./monad";
export { default as Monoid } from "./monoid";
export { default as Natural } from "./natural";
export { default as Ord } from "./ord";
export { default as Semigroup } from "./semigroup";
export { default as Show } from "./show";
export { default as Swap } from "./swap";
export { default as Tap } from "./tap";
export { default as Thenable } from "./thenable";
export { default as Traversable } from "./traversable";
export { default as Runnable } from "./runnable";

import type { BoxedEnum, BoxedEnumRep } from "./boxedEnum";
import type { BoxedEnumTypeRep } from "./boxedEnumType"; 
import type { EnumValue, EnumTypeRep } from "./enumType"
import type { Boxed, Matcher, MatcherRep } from "../_internals/types";
import { default as _RawUnion } from './union';

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
export * from "./functor"
export { AutoType, NewType, createAutoDefinition } from "./union";
export { Ordering } from "./ord";

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