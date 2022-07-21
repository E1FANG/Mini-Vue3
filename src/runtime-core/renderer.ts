import { isObject } from "../shared/index"
import { createComponentInstance, setUpComponent } from "./component"

export function render(vnode, container) {
  // patch 
  // 
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理element
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
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
  const {  children } = vnode
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    // children.forEach(child=>{
    //   patch(child,el)
    // })
    mountChildren(vnode, el)
  }
  // props
  const {  props } = vnode
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
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