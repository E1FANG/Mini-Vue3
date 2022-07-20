'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (value) => {
    return value !== null && typeof value === 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setUpComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStateComponent(instance);
}
function setupStateComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // setup会返回function 或者 object
        // 如果是function 就会认为是个render 函数
        // 如果是object，就会把这个object注入当前的组件当中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function obj
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
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

function render(vnode, container) {
    // patch 
    // 
    patch(vnode, container);
}
function patch(vnode, container) {
    debugger;
    // 处理element
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 去处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    const el = document.createElement(type);
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // children.forEach(child=>{
        //   patch(child,el)
        // })
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(child => {
        patch(child, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vndoe, container) {
    const instance = createComponentInstance(vndoe);
    setUpComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    // subTree 虚拟节点树
    const subTree = instance.render();
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成vNode
            // component -> vNode
            // 后续的所有逻辑操作，都会基于 vNode虚拟节点 做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
