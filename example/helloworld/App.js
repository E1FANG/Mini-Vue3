import { h } from "../../lib/guide-mini-vue.esm.js"

window.self = null
export const App = {
  render() {
    window.self  = this
    return h(
      "div",
      {
        id:'root',
        class:["red","hard"]
      },
      // setupState
      // this.$el -> get root element 
      // "hi, " + this.msg
      // string
      // "hi,mini-vue"
      // array
      [
        h('div',{class:['red']},"hi"),
        h("div",{class:['blue']},this.msg +' '+this.customShow)
      ]
    )
  },

  setup() {
    // composition api
    return {
      msg: 'mini-vue',
      customShow:'ack'
    }
  }
}