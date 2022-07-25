import { isObject } from "../shared/index"
import { mutableHandlers, readonlyHandlers,shallowReadonlyHandlers } from "./baseHandler"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw){
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value){
  // 重点触发get，返回is_reactive这个key，通过取反isReadonly获得

  // 当对象不是响应式对象时，应该返回false
  // 如果不是响应式对象，则无法触发get，原始对象上并没有挂载到key，所以返回undefine，只需转换成布尔值即可
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value){
  return isReactive(value) || isReadonly(value)
}

const createReactiveObject = (target:any,baseHandler)=>{
  if(!isObject(target)){
    console.warn(`target${target}必须是一个对象！`);
    return target
  }
  return new Proxy(target, baseHandler)
}