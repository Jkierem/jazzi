export { default as Applicative } from "./applicative";
export { default as BoxedEnum } from "./boxedEnum";
export { default as BoxedEnumType } from "./boxedEnumType";
export { default as EnumType } from "./enumType";
export { default as Enum } from "./enum";
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
import { default as _RawUnion } from './union'

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
export * from "./functor";
export { AutoType, NewType, createAutoDefinition } from "./union";
export { Ordering } from "./ord";
