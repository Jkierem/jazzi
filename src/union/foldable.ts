import { getInnerValue } from "../_internals/symbols"
import { AnyBox } from "../_internals/types"

export type Foldable<Left,Right> = {
    fold: <C,D>(fnLeft: (a: Left) => C, fnRight: (b: Right) => D) => C | D
}

export const Foldable = (impl: "Right" | "Left" = "Right") => <T extends AnyBox>(obj: T) => {
    return {
        ...obj,
        fold(left: any, right: any){
            if( impl === "Right" ){
                right(this.get())
            }
            return left(this.get())
        }
    }
}