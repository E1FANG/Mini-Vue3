import { track, trigger } from "./effect"


export function reactive(row){
  const handler = {
    get(target,key){
      // TODO track
      track(target,key)
      return  Reflect.get(target,key)
    },
    set(target,key,value){
      // TODO trigger
      trigger(target,key)
      return Reflect.set(target,key,value)
    }
  }
  return new Proxy(row,handler)
}