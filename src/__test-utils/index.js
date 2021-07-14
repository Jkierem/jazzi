import any from 'ramda/src/any';
import equals from 'ramda/src/equals';
import map from 'ramda/src/map';

const prop = (key) => (obj) => obj?.[key];

/* istanbul ignore next : spy works believe me*/
export const Spy = (fn = x => x) => {
    let callCount = 0;
    let calls = []
    let _spy = (...args) => {
        callCount++;
        const res = fn(...args)
        calls.push({
            args, 
            result: res, 
            callTime: Date.now(),
            calledBefore(otherCall){
                return this.callTime - otherCall.callTime < 0
            },
            calledAfter(otherCall){
                return this.callTime - otherCall.callTime >= 0
            }
        });
        return res;
    }

    Object.defineProperty(_spy,"called",{
        get: () => callCount > 0
    })
    Object.defineProperty(_spy,"callCount",{
        get: () => callCount
    })
    Object.defineProperty(_spy,"calls",{
        get: () => calls
    })
    Object.defineProperty(_spy,"calledOnce",{
        get: () => callCount === 1
    })
    Object.defineProperty(_spy,"calledTwice",{
        get: () => callCount === 2
    })
    Object.defineProperty(_spy,"calledThrice",{
        get: () => callCount === 3
    })

    _spy.calledWith = (...args) => any(equals(args),map(prop("args"))(calls));
    _spy.returned = (val) => any(equals(val),map(prop("result"))(calls));

    _spy.reset = () => {
        callCount = 0 
        calls = []
    }

    _spy.debug = () => {
        return {
            callCount: _spy.callCount,
            calls: _spy.calls,
            called: _spy.called,
        }
    }

    return _spy
}

/* istanbul ignore next : log works believe me*/
export const log = x => {
    console.log(x)
    return x
}