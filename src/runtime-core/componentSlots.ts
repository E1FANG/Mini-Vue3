import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]

  const { vnode } = instance

  const slots = {}

  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {


    for (const key in children) {
      const value = children[key]

      //slot
      slots[key] = (props) => normalizeSlotValue(value(props))
    }

    instance.slots = slots

  }

}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}