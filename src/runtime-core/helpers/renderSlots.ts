import { createVNode } from "../vnode";

export function renderSlots(slots,name,props){
  // 该函数解决当slots是一个数组的时候，无法渲染的问题
  // 只需要将slot变成一个虚拟节点，交给patch去处理即可
  const slot = slots[name]
  if(slot){
    if(typeof slot === 'function'){
      return createVNode('div',{},slot(props))
    }
    return createVNode('div',{},slot)
  }
}