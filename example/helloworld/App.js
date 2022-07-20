import { h } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  render() {
    return h(
      "div",
      {
        id:'root',
        class:["red","hard"]
      },
      // "hi, " + this.msg
      // string
      // "hi,mini-vue"
      // array
      [
        h('div',{class:['red']},"hi"),
        h("div",{class:['blue']},"mini-vue")
      ]
    )
  },

  setup() {
    // composition api
    return {
      msg: 'mini-vue'
    }
  }
}