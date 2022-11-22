import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setUpComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

  function render(vnode, container) {
    // patch
    //
    patch(null, vnode, container, null);
  }

  // n1 之前的vdom
  // n2 新的vdom
  // 如果n1不存在，就是初始化，存在就是更新
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;

      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理element
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 去处理组件
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement");
    console.log(n1);
    console.log(n2);
    // 处理children
    // 处理props
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    // createElement new Element()
    // const el = (vnode.el = document.createElement(vnode.type))
    const el = (vnode.el = hostCreateElement(vnode.type));

    // children
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // children.forEach(child=>{
      //   patch(child,el)
      // })
      mountChildren(vnode, el, parentComponent);
    }
    // props
    // patchProp
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, val);
    }
    // insert
    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((child) => {
      patch(null, child, container, parentComponent);
    });
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setUpComponent(instance);

    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      // 区分 渲染还是更新
      if (!instance.isMounted) {
        console.log("init");
        // subTree 虚拟节点树
        const { proxy } = instance;

        // 绑定了render的this指向是proxy，那么在render里面就可以用this访问setup等数据了
        const subTree = (instance.subTree = instance.render.call(proxy));

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance);

        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;

        console.log("current", subTree);
        console.log("prev", prevSubTree);
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }
  return {
    createApp: createAppApi(render),
  };
}
