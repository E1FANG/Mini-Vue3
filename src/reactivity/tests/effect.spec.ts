import { reactive } from "../reactive"
import {effect,stop} from '../effect'

describe("effect", ()=>{
  it("happy path",()=>{
    const user = reactive({
      age:10
    })
    let userAge 

    effect(()=>{
      userAge = user.age + 1
    })

    // init 
    expect(userAge).toBe(11)

    // update
    user.age ++
  
    expect(userAge).toBe(12)
  })

  it("scheduler", () => {
    // 1. 通过effect的第二个参数  给定的一个 scheduler 的 fn
    // 2. effect第一次执行的时候，还会执行fn
    // 3. 当响应式对象 set update ， 不会执行 fn 而是执行scheduler
    // 4. 如果说 当执行runner的时候，会再次执行 fn
  
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });

  it('stop',()=>{
    let dummy
    const obj = reactive({foo:1})
    const runner = effect(()=>{
      dummy = obj.foo
    })
    obj.foo = 2
    expect(dummy).toBe(2)

    stop(runner)
    // obj.foo = 3 // 只触发了set
    obj.foo ++
    // obj.foo ++  相当于obj.foo = obj.foo + 1 就是触发了get和set
    // 当触发了get之后，又会重新收集依赖，在后续的set里，又通知了effect执行，所以stop失效了。
    // 所以需要在触发依赖收集的地方，判断一下，stop

    expect(dummy).toBe(2)

    runner()
    expect(dummy).toBe(3)

  })

  it("onStop",()=>{
    let dummy
    let obj = reactive({foo:1})
    let onStop = jest.fn()
    const runner = effect(()=>{
      dummy = obj.foo
    },{
      onStop
    })
    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })

})

it("",()=>{
  // effect(fn)  -> function runner  -> fn -> return
  let foo = 10

  let runner =effect( ()=>{
    foo ++
    return foo
  })

  expect(foo).toBe(11)

  const r = runner()

  expect(r).toBe(foo)

})