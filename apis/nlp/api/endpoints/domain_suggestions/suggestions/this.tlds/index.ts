import tlds_location_specific from "@ps/nlp/data/domains/location_specific"
import tlds_from_chunks from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.tlds/function/tlds_from_chunks"
// import { arr_subtract, arrays_mix } from "@ps/fn/io/arrays"
import object_keys_from_array_values from "@ps/fn/io/obj/obj_keys_from_array"
// import tlds_all from "@ps/nlp/data/domains/all"
import tlds_black from "@ps/nlp/data/domains/manual/black"
import mixin_tlds_general from "@ps/nlp/data/domains/mixins/general"
import mixin_tlds_brand from "@ps/nlp/data/domains/mixins/brand"
import mixin_tlds_name from "@ps/nlp/data/domains/mixins/name"
import mixin_tlds_tech from "@ps/nlp/data/domains/mixins/tech"
import sort_strings_by_rating_and_position from "@ps/fn/io/sort_strings/sort_strings_by_rating_and_position"
// import sort_preferences_all from "@ps/nlp/data/domains/sort_preferences_all"
import generic_tlds from "@ps/nlp/data/domains/mixins/generic"

/**
 * Suggestions
 * @param params {object}
 * @param params.chunks_keys {array} - array of key strings
 * @param params.chunks_dict {object} - object of key : {key:'',root:'',derivations:[],ok_list:[],...etc}
 * @returns this.tlds {array} - list of domain extensions
 */
let DEBUG1 = false
export default async function make_tlds(this: any) {
  // generate tlds
  let { yes_tlds, maybe_tlds }: any = await tlds_from_chunks.call(this)

  /*
   *
   * sort
   *
   */
  if (
    (this.chunks_dict["black"] && this.chunks_dict["lives"]) ||
    (this.chunks_dict["black"] && this.chunks_dict["rights"]) ||
    this.chunks_dict["blm"]
  ) {
    /*
     *
     * sort black
     *
     */
    let tlds_black_arr = Object.keys(tlds_black)
    let highest_index = tlds_black_arr.length
    /*
     * rate each tld -
     * default 1,
     * add more points if it appears higher in tld_black list
     */
    {
      let ratings = object_keys_from_array_values(yes_tlds, 1)
      for (let tld_black of tlds_black_arr) {
        if (ratings[tld_black]) {
          ratings[tld_black] += highest_index
        }
        highest_index--
      }
      // sort by rating and position
      yes_tlds = sort_strings_by_rating_and_position(yes_tlds, ratings, 0.1)
    }
    {
      let ratings = object_keys_from_array_values(maybe_tlds, 1)
      for (let tld_black of tlds_black_arr) {
        if (ratings[tld_black]) {
          ratings[tld_black] += highest_index
        }
        highest_index--
      }
      // sort by rating and position
      maybe_tlds = sort_strings_by_rating_and_position(maybe_tlds, ratings, 0.1)
    }
  } else {
    /*
     *
     * sort everything else
     *
     */
    // yes_tlds = sort_strings_by_rating_and_position(yes_tlds, sort_preferences_all, 10000)
    if (DEBUG1) global.cconsole.log("yes_tlds sorted", yes_tlds)
    // maybe_tlds = sort_strings_by_rating_and_position(maybe_tlds, sort_preferences_all, 1)
    if (DEBUG1) global.cconsole.log("maybe_tlds sorted", maybe_tlds)
  }

  /*
   *
   * Remove location-specific tlds
   *
   */
  for (let tld of yes_tlds) {
    if (tlds_location_specific[tld]) {
      yes_tlds.splice(yes_tlds.indexOf(tld), 1)
    }
  }
  for (let tld of maybe_tlds) {
    if (tlds_location_specific[tld]) {
      maybe_tlds.splice(maybe_tlds.indexOf(tld), 1)
    }
  }

  /*
   *
   * tlds + mixin default tlds
   *
   */
  let mix_tlds = []
  for (let ti = 0; ti <= 30; ti++) {
    // mix in default TLDs
    if (this.is_name) {
      mix_tlds.push(mixin_tlds_name[ti])
    }
    if (this.is_brand) {
      mix_tlds.push(mixin_tlds_brand[ti])
    }
    if (this.is_tech) {
      mix_tlds.push(mixin_tlds_tech[ti])
    }
    if (!this.is_name && !this.is_brand && !this.is_tech) {
      mix_tlds.push(mixin_tlds_general[ti])
    }
    // unreliable TLDs
    if (maybe_tlds[ti]) {
      mix_tlds.push(maybe_tlds[ti])
    }
  }

  /*
   *
   * unique, limit, user checked/unchecked, sort
   *
   */
  let limit = this.options.ext_suggestions_num
  // if (limit < yes_tlds.length + 10) {
  //   limit = yes_tlds.length + 10
  // }
  // yes_tlds = sort_strings_by_rating_and_position(yes_tlds, sort_preferences_all, 2)
  // finalize output
  this.tlds = [...new Set([...(this.tlds_user || []), "com", ...yes_tlds, ...mix_tlds])].slice(0, limit)
  this.tlds_extra = this.tlds.slice(limit)
  this.tlds_with_generic = [...this.tlds, ...generic_tlds]

  // if (this.tlds_unchecked.length) {
  //   this.tlds = arr_subtract(this.tlds, this.tlds_unchecked)
  //   this.tlds_use = arr_subtract(this.tlds_use, this.tlds_unchecked)
  // }
  // this.tlds_extra = [...new Set(arr_subtract(this.tlds_extra, this.tlds))]
  if (DEBUG1) {
    global.cconsole.info("this.tlds", this.tlds)
    global.cconsole.info("this.tlds_use", this.tlds_use)
    // global.cconsole.info("this.tlds_extra", this.tlds_extra)
  }

  /*
   *
   * find extra TLD in SLD
   *
   */
  // for (let key of this.chunks_keys) {
  //   if (tlds_all[key]) {
  //     this.tld_parsed = key
  //   }
  // }
}

// function rate_pos1(pos1) {
//   if (pos1 === 'nouns') return 10
//   if (pos1 === 'adjectives' || pos1 === 'verbs' || pos1 === 'adverbs') return 4
//   return 1
// }
//
// function sort_tld_keys_by_domlength_asc(b, a) {
//   let domlength = this // usage: arr.sort(func.bind(obj))
//   return (domlength[b] || 0) - (domlength[a] || 0)
// }
//
// function sort_tld_keys_by_posrating_desc(b, a) {
//   let posrating = this // usage: arr.sort(func.bind(obj))
//   return (posrating[a] || 0) - (posrating[b] || 0)
// }
