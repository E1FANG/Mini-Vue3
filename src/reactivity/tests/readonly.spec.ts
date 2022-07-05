import {readonly} from '../reactive'

describe("readonly",()=>{
  it('happy path',()=>{
    // readonly 就是不可以被set
    const original = {
      foo:1
    }
    const observed =  readonly(original)
    expect(original).not.toBe(observed)
    expect(observed.foo).toBe(1)
  })
  it("warn then call set",()=>{
    // console.warn
    // mock
    console.warn = jest.fn()
    const user = readonly({
      age:10
    })
    user.age = 11
    expect(console.warn).toBeCalled()
  })
})