import { createComponentInstance, setUpComponent } from "./component"

export function render(vnode,container){
  // patch 
  // 
  patch(vnode,container)
}

function patch(vnode,container){

  // 去处理组件
  processComponent(vnode , container)
}

function processComponent(vnode:any,container:any){
  mountComponent(vnode,container)
}

function mountComponent(vndoe,container){
  const instance =  createComponentInstance(vndoe)

  setUpComponent(instance)

  setupRenderEffect(instance,container)
}

function setupRenderEffect(instance,container){
  // subTree 虚拟节点树
  const subTree = instance.render()

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree,container)
}