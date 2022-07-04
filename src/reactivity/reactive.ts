import { track, trigger } from "./effect"


// 高阶函数
function createGetter(isReadonly=false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)

    if (!isReadonly) {
      track(target, key)
    }

    return res
  }
}



export function reactive(row) {
  const handler = {
    get:createGetter(),
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    }
  }
  return new Proxy(row, handler)
}

export function readonly(row) {
  const handler = {
    get:createGetter(true),
    set() {
      return true
    }
  }
  return new Proxy(row, handler)
}