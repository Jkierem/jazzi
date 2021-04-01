interface Reader<Env,A> {
    map: <B>(fn: (a: A) => B) => Reader<Env,B>;
    chain: <B>(fn: (a: A) => Reader<Env,B>) => Reader<Env,B>;
    run: (env: Env) => A;
}

const Reader = <E,A>(fn: (env: E) => A): Reader<E,A> => {
    return {
      map<B>(fn1: (a: A) => B): Reader<E,B>{
        return Reader((env: E) => fn1(fn(env)));
      },
      chain(fn1){
        return Reader((env:E) => fn1(fn(env)).run(env));
      },
      run(env){
        return fn(env)
      }
    }
}
  
Reader.of = <A,B>(fn: (a: A) => B) => Reader<A,B>(fn);
Reader.ask = () => Reader<any,any>(x => x)

export default Reader