import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  };
  return component
}

export function setUpComponent(instance) {
  // TODO
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

export function setupStatefulComponent(instance) {
  const Component = instance.type
  // 利用proxy，代理所有的需要在组件内部访问的东西。
  // 比如说 setup返回的东西
  // this.$el访问组件根节点
  instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)
  const { setup } = Component
  if (setup) {
    // setup会返回function 或者 object
    // 如果是function 就会认为是个render 函数
    // 如果是object，就会把这个object注入当前的组件当中
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // function obj
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  // 处理：保证组件的render 是有值的
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // 判断当前组件有无对应的render
  const Component = instance.type

  // if(Component.render){
  instance.render = Component.render
  // }
}