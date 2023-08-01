type Key = string | number | symbol

export const Value    = Symbol("@@value");
export const Type     = Symbol("@@type");
export const Variant  = Symbol("@@variant");
export const Env      = Symbol("@@env");
export const ErrorMap = Symbol("@@errormap");
export const Producer = Symbol("@@producer");
export const Scheduler = Symbol("@@scheduler");

export type WithSymbol<T extends symbol,U> = { [P in T]: U }

export type WithValue<T> = WithSymbol<typeof Value, T>
export type WithType<TName extends Key> = WithSymbol<typeof Type, TName>
export type WithVariant<VName extends Key> = WithSymbol<typeof Variant, VName>
export type WithEnv<T> = WithSymbol<typeof Env, T>
export type WithErrorMap<T> = WithSymbol<typeof ErrorMap, T>

export const getSymbol = <Sym extends symbol>(sym: Sym) => <T>(withSym: T): T extends WithSymbol<Sym, infer U> ? U : undefined => (withSym as any)?.[sym]!

export const getValue = getSymbol(Value)
export const getType = getSymbol(Type)
export const getVariant = getSymbol(Variant)
export const getEnvironment = getSymbol(Env)
export const getProducer = getSymbol(Producer)
export const getScheduler = getSymbol(Scheduler)

export const setSymbol = <Sym extends symbol>(sym: Sym) => <T>(value: T) => <U>( withSym: U): U & WithSymbol<Sym,T> => {
    (withSym as any)[sym] = value
    return withSym as U & WithSymbol<Sym,T>
} 

export const setValue = setSymbol(Value)
export const setType = setSymbol(Type)
export const setVariant = setSymbol(Variant)
export const setEnvironment = setSymbol(Env)
export const setProducer = setSymbol(Producer)
export const setScheduler = setSymbol(Scheduler)