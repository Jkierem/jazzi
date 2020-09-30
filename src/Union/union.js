import { fromPairs, is, toPairs } from 'ramda'
import { setType, setInnerValue, getInnerValue, setVariant, extractWith, getVariant, getCase, setTypeclasses, getTypeclass, setTypeName } from '../_internals'
import Show from './show'

const mapObj = fn => obj => fromPairs(toPairs(obj).map(fn))

const Box = (config) => (cases) => {
    Object.keys(cases).forEach((trivial,idx,keys) => {
        cases[trivial].prototype.unwrap = function(){
            let inner = this.get();
            while( inner?.get ){
                inner = inner.get()
            }
            return inner
        }
        cases[trivial].prototype.get = function(fn){
            return getInnerValue(this)
        }
        cases[trivial].prototype.match = function(patterns){
            return extractWith([this.get()])(getCase(getVariant(this),patterns));
        }
        if( !config?.noHelpers && Object.keys(cases).length > 1 ){
            cases[trivial].prototype[`on${trivial}`] = function(fn){
                return extractWith([this.get()])(fn)
            }
            cases[trivial].prototype[`is${trivial}`] = function(){
                return true
            }
            keys.filter(x => x !== trivial).forEach( key => {
                cases[trivial].prototype[`is${key}`] = function(){
                    return false
                }
                cases[trivial].prototype[`on${key}`] = function(fn) {
                    return this.get()
                }
            })
        }
    })
}

const Union = (name, cases, exts, config) => {
    const extensions = [ Box(config), ...exts ]
    const tcs =  extensions.map(tc => getTypeclass(tc)).filter(Boolean)
    let typeRep = {}
    const mappedCases = mapObj(([key,val]) => {
        return [key , function(...args){
            setTypeName(name,this)
            setVariant(key,this)
            setInnerValue(val(...args),this)
            setTypeclasses(() => tcs,this)
            setType(() => typeRep,this);
        }]
    })(cases)
    const globals = {}
    extensions.forEach(fn => fn(mappedCases,globals))
    return {
        constructors(cons){
            const trueCases = mapObj(([key,value]) => [key, (...args) => new value(...args)])(mappedCases)
            typeRep = {
                ...trueCases,
                ...globals,
                ...mapObj(([key,fn]) => [key,fn.bind(trueCases)])(cons),
            }
            return typeRep
        }
    }
}

export const NewType = (name,exts=[]) => Union(name,
    { [name]: x => x },
    [
        Show({ overrides:{
                show: { 
                    [name](){ 
                        return `[NewType => ${name} ${this.get()}]`
                    }
                }
            }
        }),
        ...exts,
    ]).constructors({ from(...args){ return this[name](...args) }})

export default Union;