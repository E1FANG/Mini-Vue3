const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === "string") {
        // vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 给slot加上shape
    // 条件：必须是组件类型 + children是一个object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    // 该函数解决当slots是一个数组的时候，无法渲染的问题
    // 只需要将slot变成一个虚拟节点，交给patch去处理即可
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const EMPTY_OBj = {};
const isObject = (value) => {
    return value !== null && typeof value === "object";
};
const hasChanged = (val, val2) => {
    return !Object.is(val, val2);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        this._fn = fn;
    }
    run() {
        // 确保每一次执行run的时候，activeEffect都是当前的effect，正确地push进deps
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // reset
        shouldTrack = false;
        return result;
    }
    stop() {
        // 性能优化：根据active判断，只清理一次effect
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
const targetMap = new WeakMap();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, depsMap = new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, dep = new Set());
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 看看dep 之前有没有添加过，添加过的话 那么就不添加了
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, option = {}) {
    // fn()
    const _effect = new ReactiveEffect(fn, option.scheduler);
    // option
    extend(_effect, option);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 高阶函数
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看res是不是object （解决对象嵌套问题）
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key:${key} set 失败，因为target${target}是 readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
const createReactiveObject = (target, baseHandler) => {
    if (!isObject(target)) {
        console.warn(`target${target}必须是一个对象！`);
        return target;
    }
    return new Proxy(target, baseHandler);
};

/*
一般ref接收的都是 1 true "1"这种单值
如何知道这些值被get或者set了呢？
利用proxy已经不行了，因为proxy只针对对象，现在是一个值类型
所以需要用一个对象{} RefImpl类来进行包裹，在这个类里面有一个value，就可以对这个value写 get和set的拦截(依赖收集，触发依赖)
*/
// impl 接口
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        // ref 需要是响应式的
        // 所以当这个value是一个对象嵌套在ref的时候，dep没有收集到依赖，所以要把这个对象转换成响应式的
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果新值等于旧值，不执行更新，不触发修改
        // 对比的时候，如果this_value是经过reactive处理过的proxy，是无法与新值进行对比的
        // if (!hasChanged(newValue, this._value)) return
        // 所以需要一个新的变量，去存储没有处理过的value,在用这个变量去跟新值进行对比
        if (hasChanged(newValue, this._rawValue)) {
            // 如果不相等，就需要去处理这几个变量之间的关系，并且触发依赖
            this._rawValue = newValue;
            this._value = convert(newValue);
            // 一定先去修改了value的值 再去触发依赖
            triggerEffects(this.dep);
        }
    }
}
// 转换
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
// isRef 判断响应式对象是不是一个ref类型
// unRef 返回ref.value
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    // 看看是不是一个ref对象  ref -> ref.value
    //  不是的话 直接返回ref
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRef) {
    // get set
    return new Proxy(objectWithRef, {
        get(target, key) {
            // 如果是一个ref 就直接返回.value
            // 如果不是一个ref，就返回它的值
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 正常情况是要直接替换的
            // 特殊的是，当当前的值是ref且传入的新值不是ref时。不能直接替换，否则会还是要.value
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    console.log("emit", event);
    // instance.props -> event
    const { props } = instance;
    // add -> Add
    // add-foo -> addFoo
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : "";
        });
    };
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toHandlerKey = (str) => {
        return str ? "on" + capitalize(str) : '';
    };
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (i) => {
        return i.vnode.el;
    },
    $slots: (i) => {
        return i.slots;
    }
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // setupState
        if (key in setupState) {
            return setupState[key];
        }
        // 访问this属性，先检查state上的再检查props
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children]
    const { vnode } = instance;
    const slots = {};
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        for (const key in children) {
            const value = children[key];
            //slot
            slots[key] = (props) => normalizeSlotValue(value(props));
        }
        instance.slots = slots;
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setUpComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 利用proxy，代理所有的需要在组件内部访问的东西。
    // 比如说 setup返回的东西
    // this.$el访问组件根节点
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // setup会返回function 或者 object
        // 如果是function 就会认为是个render 函数
        // 如果是object，就会把这个object注入当前的组件当中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function obj
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    // 处理：保证组件的render 是有值的
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    // 判断当前组件有无对应的render
    const Component = instance.type;
    // if(Component.render){
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            //init 只执行一次
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换成vNode
                // component -> vNode
                // 后续的所有逻辑操作，都会基于 vNode虚拟节点 做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        // patch
        //
        patch(null, vnode, container, null, null);
    }
    // n1 之前的vdom
    // n2 新的vdom
    // 如果n1不存在，就是初始化，存在就是更新
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理element
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 去处理组件
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        console.log(n1);
        console.log(n2);
        const oldProps = n1.props || EMPTY_OBj;
        const newProps = n2.props || EMPTY_OBj;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const { shapeFlag } = n2;
        const c2 = n2.children;
        // 新节点为text
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 旧节点为array => ArrayToText
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 1. 把老的children 清空
                unMountChildren(n1.children);
            }
            // 2. 设置text
            // 旧节点为text => TextToText
            // 同样的处理，array的c1是必定不等于text的，ArrayToText一样会处理重新设置text
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            // 新节点为array
            // text to array
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // array diff array
                patchKeyChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        const l1 = c1.length;
        const l2 = c2.length;
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        // 检测两个节点是否一样
        function isSomeVNodeType(n1, n2) {
            // type
            // key
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (!isSomeVNodeType(n1, n2)) {
                // 递归的使用patch，因为isSomeVNodeType只检测了VNode的type和key，可能他们的子元素是不相等的。
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            debugger;
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. 新的比旧的多 创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                // 判断新元素的插入位置
                // 如果位置大于c2的长度则说明新元素在末尾插入
                // 否则，说明插入位置位于开头或中间部分，需要一个指定位置的锚点。
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    // 因为有可能不止一个节点，所以要循环
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 4. 旧的比新的多 删除
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else ;
    }
    function unMountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i];
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    // 用渲染接口去更新
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBj) {
                for (const key in oldProps) {
                    if (!newProps[key]) {
                        hostPatchProp(el, key, oldProps[key], undefined);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        // createElement new Element()
        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type));
        // children
        const { shapeFlag, children } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        // props
        // patchProp
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // insert
        console.log("---------------");
        console.log(el, container, anchor);
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setUpComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
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
                patch(null, subTree, container, instance, anchor);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppApi(render),
    };
}

function createElement(type) {
    console.log("createElement---------");
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    console.log("patchProp---------");
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    console.log("insert---------");
    // anchor 锚点 表示child的插入位置
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
