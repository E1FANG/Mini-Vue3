class ReactiveEffect{
  private _fn: any
  constructor(fn){
    this._fn = fn
  }
  run(){
    // 确保每一次执行run的时候，activeEffect都是当前的effect，正确地push进deps
    activeEffect = this
    this._fn()
  }
}
const targetMap = new WeakMap()
export function track(target,key){
  let depsMap = targetMap.get(target)
  if(!depsMap){
   targetMap.set(target, depsMap = new Map())
  }
  let dep = depsMap.get(key)
  if(!dep){
   depsMap.set(key, dep = new Set())
  }
  dep.add(activeEffect)
}

export function trigger(target,key){
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)  
  for(const effect of dep){
    effect.run()
  }
}

let activeEffect 

export function effect(fn){
  // fn()
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}