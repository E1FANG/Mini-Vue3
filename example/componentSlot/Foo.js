import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    const foo = h('div', {}, 'foo')
    console.log(this.$slots);
    // 具名插槽功能
    // 1. 获取要渲染的元素  //根据key。 比如header
    // 2. 获取要渲染到的位置

    // 作用域插槽
    const age = 18
    return h('div', {}, [
      renderSlots(this.$slots, "header", {age}),
      foo,
      renderSlots(this.$slots, "footer")
    ])
  },
  setup() {
    return {}
  }
}