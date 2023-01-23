/*
 * Dependencies
 */

// import all_domains from 'universal-wordsalad-scripts/data/domains/all';
import { data_word_get_parsed, data_word_get } from "@ps/nlp/lib/pgdb/word"
import { data_domain_get_parsed } from "@ps/nlp/lib/pgdb/domain"

/**
 * Get dictionary of domains (values) and syns1 manually entered synonyms (keys)
 * @params {string} key - "apple"
 * @resolves {object} synonyms of row.syns1 - {peach: ["apricot","plum",], pear: ["kiwi","mandarin","fruit"]}
 */
const DEBUG1 = false
const DEBUG2 = false
export default function (key) {
  return new Promise(async (resolve) => {
    let syns_of_syns: any = {}
    if (DEBUG2) global.cconsole.log(`key_syns_of_syns key="${key}"`)
    try {
      /*
       * Get row from DB
       */
      let row: any = await data_domain_get_parsed(key, "key, syns1")
      if (!row || !row.syns1) {
        if (DEBUG1) global.cconsole.warn(`!row || !row.syns1 for key="${key}"`)
        resolve({})
        return
      }
      if (DEBUG2) global.cconsole.log(`row="${row.key}" syns1 contains "${row.syns1.length}" words`)

      /*
       * Build output (synonyms of synonyms)
       */
      if (row.syns1 && row.syns1[0]) {
        /*
         * Syns *1
         */
        for (let syn1 of row.syns1) {
          let syns_of_syn1 = []
          let row1: any = await data_word_get_parsed(
            syn1,
            "key,root,pos1,pos2,singular,plural,dict,sentiment,list_count,xver,xadj,xadv,xnou,xint,xetc,xpro,xpre"
          )
          if (row1 && row1.list_count) {
            if (DEBUG1) global.cconsole.success(`found row1 key="${row1.key}" list_count="${row1.list_count}"`)
            // build list of synonyms to use for next level
            let list1 = []
            for (let key in row1.dict) {
              let info = row1.dict[key]
              if (info[0] && info[12] && (info[9] === row1.pos1 || info[9] === row1.pos2)) {
                list1.push(key)
              }
            }
            let list1_extra = []
            let list1_cut = Math.min(Math.max(10, row1.list_count / 10), 20)
            if (list1.length > list1_cut) {
              list1_extra = list1.slice(list1_cut, list1_cut + 10)
              list1 = list1.slice(0, list1_cut)
            }
            if (DEBUG2) global.cconsole.log("row1 list1", list1)
            /*
             * Syns *2
             */
            // use list list only if word is positive sentiment - if negative, use all available words
            if (DEBUG2) global.cconsole.log(`syn1="${syn1}" list contains "${list1.length}" words`)
            // if (row1["x" + row1.pos1]) {
            //   list1 = list1.slice(Number(row1["x" + row1.pos1]) || 1)
            // }
            for (let syn2 of [row1.key, row1.root, row1.singular, row1.plural, ...list1].filter((str) => !!str)) {
              let row2: any = await data_word_get_parsed(
                syn2,
                "key,root,pos1,pos2,singular,plural,acronym,abbreviation,dict,sentiment,list_count"
              )
              if (row2 && row2.list_count) {
                // build list of synonyms to use for next level
                let list2 = []
                for (let key in row2.dict) {
                  let info = row2.dict[key]
                  if (info[0] && info[12] && (info[9] === row2.pos1 || info[9] === row2.pos2)) {
                    list2.push(key)
                  }
                }
                if (list2.length > 10) {
                  list2 = list2.slice(0, 10)
                }
                if (DEBUG2) global.cconsole.log("row2 list2", list2)
                /*
                 * EXCLUDE BEFORE/AFTER FROM OK_LIST
                 */
                // ignore helper morphemes
                if (["con", "det", "pro", "pre"].includes(row2.pos1)) {
                  continue
                }
                /*
                 * Syns *1 (key)
                 */
                // push derivations and self
                if (row2.list_count >= Math.min(Math.max(row1.list_count * 0.25, 7))) {
                  syns_of_syn1.push(row2.key)
                }
                /*
                 * Syns *2 (continued)
                 */
                // if (row2.root) syns_of_syn1.push(row2.root.toLowerCase()); // no root - can change meaning!
                if (row2.singular) {
                  let row: any = await data_word_get(row2.singular.toLowerCase(), "key,list_count")
                  if (row && row.list_count >= 10) {
                    syns_of_syn1.push("" + row.key)
                  }
                }
                if (row2.plural) {
                  let row: any = await data_word_get(row2.plural.toLowerCase(), "key,list_count")
                  if (row && row.list_count >= 10) {
                    syns_of_syn1.push("" + row.key)
                  }
                }
                if (row2.abbreviation) {
                  let row: any = await data_word_get(row2.abbreviation.toLowerCase(), "key,list_count")
                  if (row && row.list_count >= 10) {
                    syns_of_syn1.push("" + row.key)
                  }
                }
                if (row2.acronym) {
                  let row: any = await data_word_get(row2.acronym.toLowerCase(), "key,list_count")
                  if (row && row.list_count >= 10) {
                    syns_of_syn1.push("" + row.key)
                  }
                }
                /*
                 * Syns *3
                 */
                // synonyms of synonyms of synonyms
                if (DEBUG2)
                  global.cconsole.log(
                    `row2 key="${row2.key}", list="${list2.toString()}", sentiment="${row2.sentiment}"`
                  )
                // for (let syn3 of [...list1_extra, ...list2]) {
                //   let row3: any = await data_word_get_parsed(syn3, "key,root,pos1,singular,plural,list_count")
                //   if (row3 && row3.list_count) {
                //     if (DEBUG1) global.cconsole.info(`row3 key="${row3.key}", list_count="${row3.list_count}"`)
                //     // push self
                //     if (row3.list_count >= Math.min(Math.max(row2.list_count * 0.25, 7),15)) {
                //       syns_of_syn1.push("__" + row3.key)
                //     }
                //     // push derivations
                //     // // if (row2.root) syns_of_syn1.push(row2.root.toLowerCase()); // no root - can change meaning!
                //     // if (row3.singular && row3.singular !== row3.key) {
                //     //   let row: any = await data_word_get(row3.singular.toLowerCase(), "key,list_count")
                //     //   if (row && row.list_count >= 10) {
                //     //     syns_of_syn1.push("__" + row.key)
                //     //   }
                //     // }
                //     // if (row3.plural && row3.plural !== row3.key) {
                //     //   let row: any = await data_word_get(row3.plural.toLowerCase(), "key,list_count")
                //     //   if (row && row.list_count >= 10) {
                //     //     syns_of_syn1.push("__" + row.key)
                //     //   }
                //     // }
                //     if (DEBUG1) global.cconsole.info(`row3 key done`)
                //   }
                // }
              }
            }
          } else {
            if (DEBUG1) global.cconsole.warn(`not found row for syn1="${syn1}"`)
          }
          /*
           * Add synonyms of each syns1, to syns_of_syn1s
           */
          syns_of_syns[syn1] = [...new Set([...syns_of_syn1])]
        }
      }
    } catch (e) {
      global.cconsole.error(e)
    }

    /*
     * Done
     */
    resolve(syns_of_syns)
  })
}
