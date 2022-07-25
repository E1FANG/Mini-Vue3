export const extend = Object.assign

export const isObject = (value) => {
  return value !== null && typeof value === 'object'
}

export const hasChanged = (val, val2) =>{
  return  !Object.is(val, val2)
}


export const hasOwn = (val,key)=>Object.prototype.hasOwnProperty.call(val,key)