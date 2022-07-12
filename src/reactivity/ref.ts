import { hasChanged, isObject } from "../shared"
import { trackEffects, triggerEffects, isTracking } from "./effect"
import { reactive } from "./reactive"

/*
一般ref接收的都是 1 true "1"这种单值
如何知道这些值被get或者set了呢？
利用proxy已经不行了，因为proxy只针对对象，现在是一个值类型
所以需要用一个对象{} RefImpl类来进行包裹，在这个类里面有一个value，就可以对这个value写 get和set的拦截(依赖收集，触发依赖)
*/


// impl 接口
class RefImpl {
  private _value: any
  // ref 的依赖只需要收集到dep里就可以了
  public dep
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    // ref 需要是响应式的
    // 所以当这个value是一个对象嵌套在ref的时候，dep没有收集到依赖，所以要把这个对象转换成响应式的
    this._value = convert(value)

    this.dep = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 如果新值等于旧值，不执行更新，不触发修改
    // 对比的时候，如果this_value是经过reactive处理过的proxy，是无法与新值进行对比的
    // if (!hasChanged(newValue, this._value)) return

    // 所以需要一个新的变量，去存储没有处理过的value,在用这个变量去跟新值进行对比
    if (hasChanged(newValue, this._rawValue)) {
      // 如果不相等，就需要去处理这几个变量之间的关系，并且触发依赖
      this._rawValue = newValue
      this._value = convert(newValue)

      // 一定先去修改了value的值 再去触发依赖
      triggerEffects(this.dep)

    }

  }
}

// 转换
function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

// isRef 判断响应式对象是不是一个ref类型
// unRef 返回ref.value

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 看看是不是一个ref对象  ref -> ref.value
  //  不是的话 直接返回ref
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRef) {
  // get set
  return new Proxy(objectWithRef, {
    get(target, key) {
      // 如果是一个ref 就直接返回.value
      // 如果不是一个ref，就返回它的值
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // 正常情况是要直接替换的
      // 特殊的是，当当前的值是ref且传入的新值不是ref时。不能直接替换，否则会还是要.value
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}