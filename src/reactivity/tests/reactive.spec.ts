import {reactive,isReactive} from '../reactive'

describe("reactive",()=>{
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

  // reactive 对象嵌套
  it("nested reactive",()=>{
    const original = {
      nested:{
        foo:1
      },
      array:[{bar:2}]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })

})
