import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i) => {
    return i.vnode.el
  },
};

export const PublicInstanceProxyHandlers = {
  get({_:instance}, key) {
    const { setupState,props } = instance
    // setupState
    if (key in setupState) {
      return setupState[key]
    }

    if(hasOwn(setupState,key)){
      return setupState[key]
    }else if(hasOwn(props,key)){
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if(publicGetter){
      return publicGetter(instance)
    }
  }
}