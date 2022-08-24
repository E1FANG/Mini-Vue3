import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setUpComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

  const { createElement, patchProp, insert } = options

  function render(vnode, container) {
    // patch 
    // 
    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent) {

    const { type, shapeFlag } = vnode
    switch (type) {
      case Fragment:
        mountChildren(vnode, container, parentComponent)
        break;

      case Text:
        processText(vnode, container)
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理element
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 去处理组件
          processComponent(vnode, container, parentComponent)
        }
        break;
    }
  }




  function processText(vnode, container) {
    const { children } = vnode
    const textNode = vnode.el = document.createTextNode(children)
    container.append(textNode)
  }


  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(vnode: any, container: any, parentComponent) {

    // createElement new Element()
    // const el = (vnode.el = document.createElement(vnode.type))
    const el = (vnode.el = createElement(vnode.type))

    // children
    const { shapeFlag, children } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // children.forEach(child=>{
      //   patch(child,el)
      // })
      mountChildren(vnode, el, parentComponent)
    }
    // props
    // patchProp
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      patchProp(el,key,val)
    }
    // insert
    insert(el,container)
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(child => {
      patch(child, container, parentComponent)
    })
  }

  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

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
    patch(subTree, container, instance)

    initialVNode.el = subTree.el
  }
  return {
    createApp:createAppApi(render)
  }
}