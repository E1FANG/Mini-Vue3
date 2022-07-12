import {extend} from '../shared';

let activeEffect
let shouldTrack
class ReactiveEffect {
  private _fn: any
  active = true
  deps = []
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run() {
    // 确保每一次执行run的时候，activeEffect都是当前的effect，正确地push进deps
    if(!this.active){
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this

    const result =  this._fn()

    // reset
    shouldTrack = false
    return result
  }
  stop() {
    // 性能优化：根据active判断，只清理一次effect
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

const targetMap = new WeakMap()

export function track(target, key) {
  if(!isTracking()) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }

  // 已经在dep中
  if(dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

function isTracking(){
  return shouldTrack && activeEffect !==undefined
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}


export function effect(fn, option: any = {}) {
  // fn()
  const _effect = new ReactiveEffect(fn, option.scheduler)
  // option
  extend(_effect,option)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}