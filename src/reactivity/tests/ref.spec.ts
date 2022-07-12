import { effect } from "../effect"
import { reactive } from "../reactive"
import { ref,isRef,unRef,proxyRefs } from "../ref"

describe("ref", ()=>{
  it("happy path",()=>{
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it("should be reactive", ()=>{
    const a = ref(1)
    let dummy
    let calls = 0 // 表示ref 的get被执行了多少次

    // 依赖收集、触发依赖
    effect(()=>{
      calls ++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)

    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  // 属性是对象的时候，这个对象也需要是响应式的
  it("should make nested properties reactive",()=>{
    const a = ref({
      count:1
    })
    let dummy
    effect(()=>{
      dummy = a.value.count
    })
    expect(dummy).toBe(1)

    a.value.count= 2
    expect(dummy).toBe(2)
  })

  it("isRef",()=>{
    const a = ref(1)
    const user = reactive({
      age:1
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })

  it("unRef",()=>{
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  // 不需要 .value也可以直接拿到ref的值 使用场景就是template ，template里面使用ref是可以不需要.value的
  it("proxyRefs", ()=>{
    const user = {
      age:ref(10),
      name:'marco'
    }

    const proxyUser = proxyRefs(user)

    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('marco')

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    // 改值的话，是会影响到最初的对象的
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})