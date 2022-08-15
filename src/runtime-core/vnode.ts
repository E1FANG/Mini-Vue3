import { ShapeFlags } from "../shared/ShapeFlags"

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null
  }
  if(typeof children === 'string'){
    // vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }else if(Array.isArray(children)){
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 给slot加上shape
  // 条件：必须是组件类型 + children是一个object
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    if(typeof children === 'object'){
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }


  return vnode
}

export function getShapeFlag(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}