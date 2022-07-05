import { mutableHandlers, readonlyHandlers } from "./baseHandler"

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

const createActiveObject = (raw:any,baseHandler)=>{
  return new Proxy(raw, baseHandler)
}