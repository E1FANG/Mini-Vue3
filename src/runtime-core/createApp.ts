import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent){
  return{
    mount(rootContainer){
      // 先转换成vNode
      // component -> vNode
      // 后续的所有逻辑操作，都会基于 vNode虚拟节点 做处理
      const vnode = createVNode(rootComponent)
      

      render(vnode,rootContainer)
    }
  }
}
