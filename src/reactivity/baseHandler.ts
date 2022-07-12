import { isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get =createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
// 高阶函数
function createGetter(isReadonly=false) {
  return function get(target, key) {
    
    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }else if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }

    const res = Reflect.get(target, key)

    // 看看res是不是object （解决对象嵌套问题）
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      track(target, key)
    }

    return res
  }
}

function createSetter(){
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers ={
  get,
  set,
}

export const readonlyHandlers ={
  get:readonlyGet,
  set(target,key){
    console.warn(`key:${key} set 失败，因为target${target}是 readonly`)
    return true
  }
}