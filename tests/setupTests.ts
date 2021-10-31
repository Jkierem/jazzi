import { Spy } from "./utils/spy"

expect.extend({
    toTypeMatch(value,name) {
        if(!value?.match){
            return {
                pass: this.isNot,
                message: () => `Expected ${value} to have match function`
            }
        } else {
            const matched = value.match({
                [name]: true,
                _: false
            })
            if( matched ){
                return {
                    pass: true,
                    message: () => `Expected ${value} to not match to ${name}`
                }
            } else {
                return {
                    pass: false,
                    message: () => `Expected ${value} to match to ${name}`
                }
            }
        }
    },
    toHaveCallCountOf(value, callCount){
        if( value.isJazziSpy ){
            const pass = value.callCount === callCount;
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have a call count of ${callCount} but got a call count ${value.callCount}`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have a call count of ${callCount} but got a call count ${value.callCount}`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy`
        }
    },
    toHaveBeenCalled(value: Spy<any,any>){
        if( value.isJazziSpy ){
            const pass = value.called
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called but it was`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called but it wasn't`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy`
        }
    },
    toHaveBeenCalledOnce(value: Spy<any,any>){
        if( value.isJazziSpy ){
            const pass = value.calledOnce
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called once but it did`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called once but got a call count of ${value.callCount}`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy`
        }
    },
    toHaveBeenCalledTwice(value: Spy<any,any>){
        if( value.isJazziSpy ){
            const pass = value.calledTwice
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called twice but it did`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called twice but got a call count of ${value.callCount}`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy`
        }
    },
    toHaveBeenCalledThrice(value: Spy<any,any>){
        if( value.isJazziSpy ){
            const pass = value.calledThrice
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called thrice but it did`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called thrice but got a call count of ${value.callCount}`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy`
        }
    },
    toHaveValueOf(value: any, expectedInner: any){
        if( value.get ){
            const pass = this.equals(value.get(), expectedInner)
            if( pass ){
                return {
                    pass,
                    message: () => `Expected inner value not to be ${expectedInner}`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected inner value to be ${expectedInner} but got ${value.get()}`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi construct`
        }
    },
    toHaveBeenCalledWith(value: Spy<any,any>, ...args){
        if( value.isJazziSpy ){
            const pass = value.calledWith(...args)
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called with ${args}`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called with ${args} but wasn't`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy`
        }
    },
    calledBefore(value: any, other: any){
        if( value.isJazziSpyCall ){
            const pass = value.calledBefore(other)
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called before other`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called before other but wasn't`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy call`
        }
    },
    calledAfter(value: any, other: any){
        if( value.isJazziSpyCall ){
            const pass = value.calledAfter(other)
            if( pass ){
                return {
                    pass,
                    message: () => `Expected spy to not have been called before other`
                }
            } else {
                return {
                    pass,
                    message: () => `Expected spy to have been called before other but wasn't`
                }
            }
        }
        return {
            pass: this.isNot,
            message: () => `Expected a jazzi spy call`
        }
    }
})