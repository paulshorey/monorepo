import words from '../input/word_endings/words.js'
import endings from '../input/word_endings/endings.js'

import fs from 'fs'

let file = ''
for (let word in words) {
  if (word.length === 1) {
    file = './output/word_endings/' + word + '.txt'
    fs.writeFileSync(file, `#${word}\n`)
  } else {
    for (let ending of endings) {
      if (ending.trim()) {
        fs.appendFileSync(file, `${word}\t + \t${ending}\t = \t${word}${ending}\n`)
      }
    }
  }
}