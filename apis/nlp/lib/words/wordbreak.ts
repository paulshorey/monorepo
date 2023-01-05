// import fs from "fs"
import wordcost from "@techytools/constants/data/words/wordbreak_cost"

// let wordlist = fs.readFileSync("data/words/words_by_frequency.txt").toString().split("\n")
// let wordcost: any = {}
// for (const [index, element] of wordlist.entries()) {
//   wordcost[element] = Math.log((index + 10) * Math.log(wordlist.length - 1)) //* (Math.log(index + 10))
// }
// function findLongestWord(wordlist) {
//   let longestWord = wordlist.reduce(function (longest, currentWord) {
//     return currentWord.length > longest.length ? currentWord : longest
//   }, "")
//   return longestWord.length
// }
let maxword_length = 15 //findLongestWord(wordlist)

const DEBUG1 = false

/**
 * Break string of characters into an array of words
 * @param {string} string - string of characters
 * @returns {array}
 */
export default async function (string) {
  if (DEBUG1) global.cconsole.log("chunk string in", string)
  /*
   * Prepare string
   */
  string = string.replace(/([a-z]+)([A-Z]+)/g, "$1 $2")
  string = string.replace(/([a-zA-Z]+)([0-9]+)/g, "$1 $2")

  /*
   * Use dynamic programming to infer location of spaces in a string without spaces.
   */

  // Build the cost array.
  let cost = [0]
  for (let i = 1; i < string.length + 1; i++) {
    let c = best_match(i, string, cost)
    cost.push(c[0])
  }

  // Backtrack to recover the minimal-cost string.
  let out = []
  let i = string.length

  while (i > 0) {
    let a = best_match(i, string, cost)
    let c = a[0]
    let k = a[1]
    out.push(string.slice(i - k, i))
    i -= k
  }

  // Sanitize
  //out = out.map((str) => str.replace(/[^\w\d\-]+/g, ""))
  format(out.reverse())

  if (DEBUG1) global.cconsole.log("chunk string out", out)
  return out
}

function best_match(i, string, cost) {
  let candidates = cost
    .slice(Math.max(0, i - maxword_length), i)
    .reverse()
    .entries()
  let a = []
  for (const [k, c] of candidates) {
    // validate word
    let word = string.slice(i - k - 1, i).toLowerCase()
    if (word.length > 1) {
      word = word.replace(/[^\w\d]+/g, "")
    }
    // construct cost
    let wcost = wordcost[word] || 9e999
    let cost = c + wcost
    a.push(cost)
  }
  let minElement = Math.min(...a)
  let minIndex = a.indexOf(minElement)
  return [minElement, minIndex + 1]
}

function format(out) {
  for (let i = 0; i < out.length; i++) {
    let i_orig = i
    let str = out[i].trim()
    let match = str.match(/[^\w\d]/g)
    if (match) {
      for (let char of match) {
        out.splice(i + 1, 0, char)
        i++
        str = str.replace(char, "")
      }
    }
    if (str === "") {
      out.splice(i_orig, 1)
      i--
    } else {
      out[i_orig] = str
    }
  }
}
