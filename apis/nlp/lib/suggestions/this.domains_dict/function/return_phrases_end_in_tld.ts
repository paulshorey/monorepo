import tlds from "@techytools/constants/data/domains/all"

export default function () {
  let domains_dict: any = {} // will return array of this (Object.values())

  let num_added = 0
  let max_hacks = 3
  if (this.chunks_keys.length === 1) {
    max_hacks = 6
  }

  /*
   *
   * word ending matches tld => domain hack
   *
   */
  for (let words of [...this.phrases, ...this.phrase_hacks]) {
    /*
     * separate last word from phrase
     */
    let last_index = words.length - 1
    if (last_index === -1) continue
    let last_word = words[last_index]
    if (!last_word) continue
    /*
     * check if last characters = tld
     */
    for (let ii = 2; ii <= 5; ii++) {
      if (last_word.length >= 6) {
        let ext = last_word.substr(-ii)
        if (tlds[ext]) {
          let str = last_word.substring(0, last_word.length - ii)
          if (str.length <= 3) continue
          if (str && num_added < max_hacks) {
            // construct domain
            let domain: any = {
              words: [str],
              tld: ext
            }
            domain.string = str + " ." + ext
            domain.list = "name"
            // save domain
            if (!domains_dict[domain.string]) {
              domains_dict[domain.string] = domain
              num_added++
            }
          }
        }
      }
    }
  }

  return Object.values(domains_dict)
}
