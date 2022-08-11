import { h } from "../../lib/guide-mini-vue.esm.js"


export const Foo = {
  setup(props,{emit}){
    console.log(111,props);
    const emitAdd = ()=>{
      console.log('emit add');
      emit('add',1,2)
      emit('add-foo',3,4)
    }
    return {
      emitAdd
    }
  },
  render(){
    const btn = h('button',{onClick:this.emitAdd},'emitAdd' + this.count)
    const foo = h('p',{},'foo')
    return h('div',{},[foo,btn])
  }
}