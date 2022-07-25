import { h } from "../../lib/guide-mini-vue.esm.js"


export const Foo = {
  setup(props){
    // props count readonly
    console.log(props);
    props.count ++
  },
  render(){
    return h("div",{},"props.count:" + this.count)
  }
}