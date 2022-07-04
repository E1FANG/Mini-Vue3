import { track, trigger } from "./effect"


export function reactive(row){
  const handler = {
    get(target,key){
      const res = Reflect.get(target,key)
      track(target,key)
      return  res
    },
    set(target,key,value){
      const res = Reflect.set(target,key,value)
      trigger(target,key)
      return res
    }
  }
  return new Proxy(row,handler)
}