interface Observable<E,A> {
    val: A
}

const subscribe = <A>(self: Observable<E,A>) => {
    type Context = {
        value: A,
        
    }
    const context = {
        value: 
    }

}