import Observable from "../Observable";
import { Spy } from "../_internals";

const createMockObservable = (creator) => {
  const nextSpy = Spy()
  const completeSpy = Spy()
  const errorSpy = Spy()
  const observable = creator()

  return {
    observable,
    run: () => observable.subscribe({
      next: nextSpy,
      complete: completeSpy,
      error: errorSpy,
    }), 
    spies: {
      nextSpy,
      completeSpy,
      errorSpy
    }
  }
}

describe("Observable", () => {
  describe("constructors", () => {
    it("should construct from function", () => {
      const {
        run,
        spies: {
          nextSpy, errorSpy, completeSpy
        }
      } = createMockObservable(() => Observable.from((sub) => {
        [1,2,3].forEach(x => sub.next(x));
        sub.complete()
        sub.error()
      }))

      run();

      expect(nextSpy.callCount).toBe(3);
      expect(nextSpy.calledWith(1)).toBeTruthy();
      expect(nextSpy.calledWith(2)).toBeTruthy();
      expect(nextSpy.calledWith(3)).toBeTruthy();

      expect(completeSpy.callCount).toBe(1);
      expect(errorSpy.called).toBeTruthy();
    })
    it("should construct from array", () => {
      const {
        run,
        spies: {
          nextSpy, errorSpy, completeSpy
        }
      } = createMockObservable(() => Observable.fromArray([1,2,3]))

      run();

      expect(nextSpy.callCount).toBe(3);
      expect(nextSpy.calledWith(1)).toBeTruthy();
      expect(nextSpy.calledWith(2)).toBeTruthy();
      expect(nextSpy.calledWith(3)).toBeTruthy();

      expect(completeSpy.callCount).toBe(1);
      expect(errorSpy.called).toBeFalsy();
    })
  })

  describe("methods", () => {
    describe("Observable", () => {
      it("unsubscribe -> should call cleanup function", () => {
        const unsubSpy = Spy()
        const { run } = createMockObservable(() => Observable.from(() => unsubSpy))
  
        expect(unsubSpy.called).toBeFalsy()
        const unsub = run();
        unsub()
        expect(unsubSpy.called).toBeTruthy()
      })
    })

    describe("Functor Observable", () => {
      it("map -> should map the next values", () => {
        const times2 = Spy(x => x * 2)
        const {
          run,
          spies: { nextSpy }
        } = createMockObservable(() => Observable.fromArray([1,2,3]).fmap(times2))
        
        expect(nextSpy.called).toBeFalsy();
        expect(times2.called).toBeFalsy();
  
        run()
  
        expect(nextSpy.callCount).toBe(3);
        expect(nextSpy.calledWith(2)).toBeTruthy();
        expect(nextSpy.calledWith(4)).toBeTruthy();
        expect(nextSpy.calledWith(6)).toBeTruthy();
        
        expect(times2.callCount).toBe(3);
        expect(times2.calledWith(1)).toBeTruthy();
        expect(times2.calledWith(2)).toBeTruthy();
        expect(times2.calledWith(3)).toBeTruthy();
      })
    })

    describe("Filterable Observable", () => {
      it("filter -> should filter values based on predicate", () => {
        const {
          run, spies: { nextSpy }
        } = createMockObservable(() => Observable.fromArray([1,2,3,4]).filter(x => x % 2 == 0))

        run()

        expect(nextSpy.callCount).toBe(2);
        expect(nextSpy.calledWith(2)).toBeTruthy();
        expect(nextSpy.calledWith(4)).toBeTruthy();        
      })
    })
  })
})