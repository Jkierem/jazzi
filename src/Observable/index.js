import { Union, Functor, Filterable } from "../Union"

const ObservableType = () => (cases,globals) => {
  cases.Observable.prototype.subscribe = function(observer){
    return this.get()(observer)
  }
}

const defs = {
  trivials: [],
  identities: [],
  overrides: {
    fmap: {
      Observable(fn){
        return Observable.Observable(sub => {
          return this.subscribe({
            next: (x) => sub.next(fn(x)),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    },
    filter: {
      Observable(pred){
        return Observable.Observable(sub => {
          return this.subscribe({
            next: (x) => pred(x) && sub.next(x),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    }
  }
}

const Observable = Union({
  name: "Observable",
  cases: {
    Observable: fn => fn
  },
  extensions:[
    ObservableType(),
    Functor(defs),
    Filterable(defs)
  ],
  config: {
    noHelpers: true
  },
  constructors: {
    of(...xs){
      return this.fromArray(xs)
    },
    from(fn){
      return this.Observable(fn)
    },
    fromPromise(p){
      return this.Observable(sub => {
        p
        .then(sub.next)
        .catch(sub.error)
        .finally(sub.complete)
      })
    },
    fromFunction(fn){
      return this.from(fn)
    },
    fromSubscribe(fn){
      return this.from(fn)
    },
    fromArray(xs){ 
      return this.Observable(sub => {
        try {
          xs.forEach(x => sub.next(x))
          sub.complete()
        } catch(e) {
          sub.error(e)
        }
      }) 
    }
  }
})

export default Observable;