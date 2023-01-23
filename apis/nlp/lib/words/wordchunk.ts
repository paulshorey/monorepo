import { data_word_get_parsed } from "@ps/nlp/lib/pgdb/word"

/**
 * @param {array} word_arr
 * @output {object}
 * @output.chunks {array of arrays} - list of words (strs) of chunked phrases
 *     same data as @output.chunks_keys, but includes capitalization/punctuation
 * @output.chunks_keys {array of arrays} - list of words (keys) of chunked phrases
 *     ONLY add key to this list if there is a corresponding value in the dictionary (chunks_rows)
 *     IMPORTANT: last item in chunks_keys should always be individual words
 * @output.chunks_rows {object} - dictionary of all chunked rows (chunk is word entry in DB)
 *     { chunk string: object from DB, }
 */
export default async function (word_arr = []) {
  let output: any = {
    chunks: [],
    chunks_keys: [],
    chunks_rows: {}
  }

  // original - check if entire phrase is a morpheme
  {
    let row: any = await get_row(word_arr.join(""), output)
    if (row && row.key) {
      output.chunks_keys.push([row.key])
    }
  }

  // find phrases within the phrase
  // ex: ["united", "states", "of", "america"] has "unitedstates"
  if (word_arr.length > 2) {
    for (let i = 0; i < word_arr.length - 1; i++) {
      let combined_key = word_arr[i] + word_arr[i + 1]
      let combined_row: any = await get_row(combined_key, output)
      if (combined_row && combined_row.key) {
        // make new word array with the combined 2 word
        let phrase_keys = []
        for (let phi = 0; phi < word_arr.length; phi++) {
          if (phi === i) {
            phrase_keys.push(combined_key)
          } else if (phi !== i && phi !== i + 1) {
            phrase_keys.push(word_arr[phi])
          }
        }
        // save new phrase, add array of words to chunks_keys
        output.chunks_keys.push(phrase_keys)
      }
    }
  }

  // add each word of phrase
  if (word_arr.length > 1) {
    output.chunks_keys.push(word_arr)
  }

  // check if any of the words is actually a combination of words
  // ex: ["unitedstates", "of", "america"] has "united"+"states"
  {
    for (let i = 0; i < word_arr.length; i++) {
      let row: any = await get_row(word_arr[i], output)
      if (row && row.str && row.str !== row.key) {
        let cwords = row.str.split(" ")
        if (cwords.length > 1) {
          // found combination word!
          // make new word array with the combined words split into individuals
          let phrase_keys = []
          for (let phi = 0; phi < word_arr.length; phi++) {
            if (phi === i) {
              // push each word in sub-phrase
              for (let word of cwords) {
                let row: any = await get_row(word, output)
                phrase_keys.push(row.key)
              }
            } else {
              // add other words
              phrase_keys.push(word_arr[phi])
            }
          }
          // save new phrase
          output.chunks_keys.push(phrase_keys)
        }
      }
    }
  }

  // check if any of the words is actually a combination of words
  // ex: ["unitedstates", "of", "america"] has "united"+"states"
  if (output.chunks_keys.length > 1) {
    let word_arr = output.chunks_keys[output.chunks_keys.length - 1]
    for (let i = 0; i < word_arr.length; i++) {
      let row: any = await get_row(word_arr[i], output)
      if (row && row.str && row.str !== row.key) {
        let cwords = row.str.split(" ")
        if (cwords.length > 1) {
          // found combination word!
          // make new word array with the combined words split into individuals
          let phrase_keys = []
          for (let phi = 0; phi < word_arr.length; phi++) {
            if (phi === i) {
              // push each word in sub-phrase
              for (let word of cwords) {
                let row: any = await get_row(word, output)
                phrase_keys.push(row.key)
              }
            } else {
              // add other words
              phrase_keys.push(word_arr[phi])
            }
          }
          // save new phrase
          output.chunks_keys.push(phrase_keys)
        }
      }
    }
  }

  // add strs from keys
  for (let phrase of output.chunks_keys) {
    let add_phrase_strs = []
    for (let key of phrase) {
      let row = output.chunks_rows[key]
      if (row) {
        if (row.pos1 === "nou" || row.name || row.brand || row.pos1 === "mod" || row.pos1 === "ctr" || row.ctr) {
          // use capitalization/punctuation
          add_phrase_strs.push(row.str)
        } else {
          // fix the str - do not just avoid this issue - later, add this logic to str_row rebuild database
          row.str = row.key
          add_phrase_strs.push(row.str)
        }
      } else {
        add_phrase_strs.push(key)
      }
    }
    output.chunks.push(add_phrase_strs)
  }

  // done
  return output
}

async function get_row(key, output) {
  // already cached
  let row = output.chunks_rows[key]
  // find in database, and cache
  if (!row) {
    // SHOULD CONTAIN THESE COLUMNS (same as in row_model.js)
    row = await data_word_get_parsed(
      key,
      "key,str,root,singular,plural,pos1,pos2,pos3,sentiment,name,brand,ctr,dict,pos_short,poss,tlds,list,ok_list,list_count,ok_count,word_count,char_count"
    )
    if (row) {
      output.chunks_rows[row.key] = row
    }
  }
  // return either one
  return row
}
