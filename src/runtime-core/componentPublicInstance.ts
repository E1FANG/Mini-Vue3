const publicPropertiesMap = {
  $el: (i) => {
    return i.vnode.el
  },
};

export const PublicInstanceProxyHandlers = {
  get({_:instance}, key) {
    const { setupState } = instance
    // setupState
    if (key in setupState) {
      return setupState[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if(publicGetter){
      return publicGetter(instance)
    }
  }
}