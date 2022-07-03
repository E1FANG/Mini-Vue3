import { reactive } from "../reactive"
import {effect} from '../effect'

describe("effect", ()=>{
  it.skip("happy path",()=>{
    const user = reactive({
      age:10
    })
    let userAge 

    effect(()=>{
      userAge = user.age + 1
    })

    // init 
    expect(userAge).toBe(11)

    // update
    user.age + 1 
    console.log(11111,userAge);
    
    expect(userAge).toBe(12)
  })
})