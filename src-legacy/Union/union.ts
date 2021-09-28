import { extractWith, getCase, expandCases, fromPairs, toPairs } from '../_internals'
import { 
    setTypeRep, 
    setInnerValue, 
    setTypeclasses, 
    setVariant,
    setTypeName,  
    getInnerValue, 
    getTypeclass, 
    getVariant
} from "../_internals/symbols"
import { AnyFn, AnyFnRec, Boxed } from "../_internals/types";
import Show from './show'

type ConstCases<K extends AnyFnRec> = {
    [P in keyof K]: new (...args: Parameters<K[P]>) => any
}

type TypeClassInstance<K extends AnyFnRec> = (cases: ConstCases<K>, globals: any) => void

const mapObj = (fn: (a: [string, any]) => [string, any]) => (obj: any) => fromPairs(toPairs(obj).map(fn))

const Box = (config?: { noHelpers?: boolean }) => <K extends AnyFnRec>(cases: ConstCases<K>) => {
    Object.keys(cases).forEach((trivial,_,keys) => {
        cases[trivial].prototype.unwrap = function(){
            let inner = this.get();
            while( inner?.get ){
                inner = inner.get()
            }
            return inner
        }
        cases[trivial].prototype.get = function(){
            return getInnerValue(this)
        }
        cases[trivial].prototype.match = function(this: Boxed<any>, patterns: AnyFnRec){
            return extractWith([this.get()])(getCase(getVariant(this),expandCases(patterns)));
        }
        cases[trivial].prototype.simpleMatch = function(this: Boxed<any>, patterns: AnyFnRec){
            return extractWith([this.get()])(getCase(getVariant(this),patterns));
        }

        function callGet<T>(this: Boxed<T>){ return this.get() }
        function extractWithGet<A,B>(this: Boxed<A>,fn: (a: A) => B){ return extractWith([this.get()])(fn) }
        function True(){ return true }
        function False(){ return false }

        if( !config?.noHelpers && Object.keys(cases).length > 1 ){
            cases[trivial].prototype[`on${trivial}`] = extractWithGet
            cases[trivial].prototype[`is${trivial}`] = True
            keys.filter(x => x !== trivial).forEach( key => {
                cases[trivial].prototype[`is${key}`] = False
                cases[trivial].prototype[`on${key}`] = callGet
            })
        }
    })
}

const Union = <K extends AnyFnRec>(name: string, cases: K, exts: TypeClassInstance<K>[], config?: { noHelpers?: boolean }) => {
    const extensions = [ Box(config), ...exts ]
    const tcs =  extensions.map(tc => getTypeclass(tc)).filter(Boolean)
    let typeRep = {}
    const mappedCases = mapObj(([key,val]: [string, AnyFn]) => {
        return [key , function(this:any, ...args: Parameters<typeof val>){
            setTypeName(name)(this)
            setVariant(key)(this)
            setInnerValue(val(...args))(this)
            setTypeclasses(() => tcs)(this)
            setTypeRep(() => typeRep)(this);
        }]
    })(cases) as ConstCases<K>
    const globals = {}
    extensions.forEach(fn => fn(mappedCases,globals))
    return {
        constructors<T extends any>(cons: T){
            const trueCases = mapObj(([key,value]: [any,any]) => [key, (...args: any[]) => new value(...args)])(mappedCases)
            typeRep = {
                ...trueCases,
                ...globals,
                ...mapObj(([key,fn]: [string, AnyFn]) => [key,fn.bind(trueCases)])(cons),
            }
            setTypeclasses(() => tcs)(typeRep)
            return typeRep as { [P in keyof K]: K[P] } & { [Q in keyof T]: T[Q] }
        }
    }
}

export const NewType = (name: string, exts: TypeClassInstance<{ [P in typeof name]: <T>(x: T) => T }>[] = []) => Union(name,
    { [name]: x => x },
    [
        Show({ overrides:{
                show: { 
                    [name](): string{ 
                        return `[${name} => ${name} ${this.get()}]`
                    }
                }
            }
        }),
        ...exts,
    ]).constructors({ 
        of(this: any,...args: any[]){ return this[name](...args) },
        from(this: any,...args: any[]){ return this[name](...args) }
    })

export const createAutoDefinition = (name: string) => ({
    trivials: [name],
    pure: [name],
    resolve: [name],
    order: [name],
    first: name,
    config: {
        noHelpers: true,
    },
    overrides: {
        fold: {
            [name]<Left>(this: any,fn: (a: any) => Left){ return fn(this.get() as any) }
        }
    }
})

export const AutoType = (name: string, exts: ((def: any) => TypeClassInstance<{ [P in typeof name]: <T>(x: T) => T }>)[]=[]) => {
    const autoDef = createAutoDefinition(name)
    const filledDefs = exts.map(ext => ext(autoDef))
    return NewType(name, filledDefs)
}

export default Union;