import { shallowReadonly } from "vue"
import { isReadonly } from "../reactive"

describe("shallowReadonly", () =>{
  it("should not make no-reactive properties reactive", ()=>{
    const props = shallowReadonly({n:{foo:1}})
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })

  it("warn then call set",()=>{
    // console.warn
    // mock
    console.warn = jest.fn()
    const user = shallowReadonly({
      age:10
    })
    user.age = 11
    expect(console.warn).toBeCalled()
  })
})