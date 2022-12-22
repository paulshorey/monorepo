import tlds from "@ps/nlp/data/domains/all"
// import remove_tld_from_phrase from "./function/remove_tld_from_phrase"
let DEBUG1 = false
export default function () {
  /*
   *
   * ADD new strings to this.domains['phrase hack']
   *
   */
  if (DEBUG1) global.cconsole.warn("this.tlds input for phrase hack = ", this.tlds)
  let tlds_set = new Set(["com", "co"])
  let tld_i = -1
  for (let tld of this.tlds_with_generic) {
    tld_i++
    if (tlds_set.size > 10) {
      break
    }
    if (tld.length <= 3) {
      tlds_set.add(tld)
    }
  }
  let tlds_arr = [...tlds_set]
  if (DEBUG1) global.cconsole.warn("use tlds for phrase hack = ", [...tlds_set])
  /*
   *
   * add TLD to each phrase hack
   *
   */
  // for each phrase
  let loop_i = 0
  for (let words of this.phrase_hacks) {
    /*
     * prepare variable
     */
    let dom: any = {
      words: words,
      list: "phrase hack",
      rating: 10
    }
    let str = words.join(" ")

    /*
     * add one for each tld
     */
    for (let tld of tlds_arr) {
      /*
       * if tld is same as one of the words
       */
      if (words.includes(tld)) {
        continue
      }
      // validate
      // end of word should not === tld
      if (str.substr(-tld.length) === tld) continue
      // edit dom
      dom = { ...dom }
      dom.tld = tld
      dom.string = str + " ." + tld
      // save dom
      if (!this.domains_dict[dom.string]) {
        this.domains_dict[dom.string] = dom
      }
    }

    /*
     * add dom hack
     * (last, after other tlds - because this changes the words)
     */
    // don't bother with really short ones - they're not available
    // if (str.length >= 5) {
    //   // check 2-4 letter tlds
    //   for (let length of [2, 3, 4]) {
    //     if (str.length - length <= 2) continue
    //     let suffix = str.substr(-length)
    //     if (suffix === "to") {
    //       continue
    //     }
    //     if (
    //       ["a", "e", "i", "o", "u", "y"].includes(suffix[suffix.length - 1]) ||
    //       ["a", "e", "i", "o", "u", "y"].includes(suffix[0])
    //     ) {
    //       if (tlds[suffix]) {
    //         // edit dom
    //         dom = { ...dom }
    //         dom.tld = suffix
    //         dom.words[dom.words.length - 1] = str.substring(0, str.length - length)
    //         dom.string = dom.words.join(" ") + " ." + dom.tld
    //         // save dom
    //         if (!this.domains_dict[dom.string]) {
    //           this.domains_dict[dom.string] = dom
    //         }
    //       }
    //     }
    //   }
    // }
    /*
     * remove one tld each few loops - leave only first best 2
     */
    if (tlds_arr.length > 2 && !(loop_i % 3)) {
      tlds_arr.pop()
    }
    // next hack
    loop_i++
  }
}
