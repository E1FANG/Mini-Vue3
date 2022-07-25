import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

window.self = null
export const App = {
  render() {
    window.self  = this
    return h(
      "div",
      {
        id:'root',
        class:["red","hard"],
        onClick(){
          console.log('click')
        },
        onMousedown(){
          console.log('onMousedown');
        }
      },
      // setupState
      // this.$el -> get root element 
      // "hi, " + this.msg
      // string
      // "hi,mini-vue"
      // array
      [
        h('div',{class:['red']},"hi"),
        h("div",{class:['blue']},this.msg +' '+this.customShow),
        h(Foo,{
          count:1
        })
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