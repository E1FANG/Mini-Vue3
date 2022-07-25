import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setUpComponent } from "./component"

export function render(vnode, container) {
  // patch 
  // 
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理element
  const {shapeFlag} = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 去处理组件
    processComponent(vnode, container)
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
 
  const el = (vnode.el = document.createElement(vnode.type))

  // children
  const {  shapeFlag,children } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // children.forEach(child=>{
    //   patch(child,el)
    // })
    mountChildren(vnode, el)
  }
  // props
  const {  props } = vnode
  const isOn = (key:string)=> /^on[A-Z]/.test(key)
  for (const key in props) {
    const val = props[key]
    if(isOn(key)){
      const event = key.slice(2).toLocaleLowerCase()
      el.addEventListener(event,val)
    }else{
    el.setAttribute(key, val)
    }
  }
  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(child => {
    patch(child, container)
  })
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode)

  setUpComponent(instance)

  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  // subTree 虚拟节点树
  const { proxy } = instance
  // 绑定了render的this指向是proxy，那么在render里面就可以用this访问setup等数据了
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)

  initialVNode.el = subTree.el
}