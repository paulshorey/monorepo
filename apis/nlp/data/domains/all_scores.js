import all from "./all"

let arr = Object.keys(all)

let scores = {}
let score = arr.length //Math.round(arr.length / 2)
// start with highest score, but half it, so -
// the highest score is positive 50%, middle score is zero, and lowest score is negative 50%
for (let tld of arr) {
  scores[tld] = score
  score-- // each subsequent item gets -= 1 score
}

// console.log('scores', scores)
export default scores
