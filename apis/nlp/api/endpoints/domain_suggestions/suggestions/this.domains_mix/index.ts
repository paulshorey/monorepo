import strings_shuffle_first_last_strict from "@techytools/fn/io/strings/strings_shuffle_first_last2"
import strings_shuffle_first3 from "@techytools/fn/io/strings/strings_shuffle_first2"
import sort_strings_by_rating_and_position from "@techytools/fn/io/sort_strings/sort_strings_by_rating_and_position"
// import sort_strings_by_length_and_position from "@techytools/fn/io/sort_strings/sort_strings_by_length_and_position"

/**
 * Sort list of domains
 */
let DEBUG1 = true
export default function (this: any) {
  let domains_strings = []
  for (let domstr in this.domains_dict) {
    // domstr = domstr.replace(/\s/g, '')
    domains_strings.push(domstr)
  }
  // console.log('this.dom_ratings',this.dom_ratings)

  domains_strings = strings_shuffle_first_last_strict(domains_strings)
  domains_strings = sort_strings_by_rating_and_position(domains_strings, this.dom_ratings, 0.001)
  domains_strings = strings_shuffle_first3(domains_strings)

  let w = 0
  let coms = []
  for (let dom of domains_strings) {
    let str = this.string.replace(/ /g, "")
    if (dom.substring(0, dom.indexOf(".")).replace(/ /g, "") + " " === str + " ") {
      continue
    }
    if (dom.substr(-3) === "com") {
      coms.push(dom)
    }
    if (w < 100) {
      this.domains_lists.mix.push(dom)
    }
    console.log([dom, this.dom_ratings[dom]])
    w++
  }
  this.domains_lists.com = coms.slice(0, 30)
}
