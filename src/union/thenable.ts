import { AnyBox, InnerValueOf } from "../_internals/types"

export type Thenable<A> = {
    then(res: (a: A) => void, rej: (err: any) => void): void,
    catch(onErr: (err: any) => void): void,
    toPromise(): Promise<A>,
}

export const Thenable = (impl: "Resolve" | "Reject" = "Resolve") => <T extends AnyBox>(obj: T) => {
    return {
        ...obj,
        then(res: (a: InnerValueOf<T>) => void, rej: (err: any) => void){
            if( impl === "Resolve" ){
                res(this.get())
            }
            rej(this.get())
        },
        toPromise(){
            if( impl === "Resolve" ){
                return Promise.resolve(this.get())
            }
            return Promise.reject(this.get())
        },
        catch(fn: (err: any) => void){
            this.then(() => {},fn)
        }
    }
}