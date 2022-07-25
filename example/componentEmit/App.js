import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  render() {
    return h("div",{},[
      h("div", {}, "app"),
      h(Foo, {
        onAdd(a,b){
          // on + Event
          console.log("onAdd",a,b);
        },
        onAddFoo(a,b){
          console.log("onAddFoo",a,b);
        }
      })
    ])
  },

  setup() {
    return {}
  }
}