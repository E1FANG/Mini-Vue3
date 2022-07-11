import {reactive,isReactive} from '../reactive'
it('happy path',()=>{
  // readonly 就是不可以被set
  const original = {
    foo:1
  }
  const observed =  reactive(original)
  expect(original).not.toBe(observed)
  expect(observed.foo).toBe(1)
  expect(isReactive(observed)).toBe(true)
  
  // 当对象不是响应式对象时，应该返回false
  expect(isReactive(original)).toBe(false)
})