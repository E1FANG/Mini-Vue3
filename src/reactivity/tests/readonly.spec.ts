import {readonly} from '../reactive'
it('happy path',()=>{
  // readonly 就是不可以被set
  const original = {
    foo:1
  }
  const observed =  readonly(original)
  expect(original).not.toBe(observed)
  expect(observed.foo).toBe(1)
})