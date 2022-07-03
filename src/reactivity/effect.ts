class ReactiveEffect{
  private _fn: any
  constructor(fn,public scheduler?){
    this._fn = fn
  }
  run(){
    // 确保每一次执行run的时候，activeEffect都是当前的effect，正确地push进deps
    activeEffect = this
    return  this._fn()
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
    if(effect.scheduler){
      effect.scheduler()
    }else{  
      effect.run()
    }
  }
}

let activeEffect 

export function effect(fn,option:any={}){
  // fn()
  const scheduler = option.scheduler
  const _effect = new ReactiveEffect(fn,scheduler)
  _effect.run()

  return _effect.run.bind(_effect)
}