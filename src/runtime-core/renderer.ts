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
    processElement(vnode,container)
  } else if (isObject(vnode.type)) {
    // 去处理组件
    processComponent(vnode, container)
  }
}

function processElement(vnode:any,container:any){
  mountElement(vnode,container)
}

function mountElement(vnode:any,container:any){
  const {type,props, children} = vnode
  const el = document.createElement(type)
  if(typeof children === 'string'){
    el.textContent = children
  }else if(Array.isArray(children)){
    // children.forEach(child=>{
    //   patch(child,el)
    // })
    mountChildren(vnode,el)
  }
  for(const key in props){
    const val = props[key]
    el.setAttribute(key,val)
  }
  container.append(el)
}

function mountChildren(vnode,container){
  vnode.children.forEach(child=>{
    patch(child,container)
  })
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vndoe, container) {
  const instance = createComponentInstance(vndoe)

  setUpComponent(instance)

  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  // subTree 虚拟节点树
  const subTree = instance.render()

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}