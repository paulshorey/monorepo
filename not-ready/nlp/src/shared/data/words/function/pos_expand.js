import pos_expand from '../dict/pos_expand'

export default function (str) {
  let string = pos_expand[str]
  return string || str
}