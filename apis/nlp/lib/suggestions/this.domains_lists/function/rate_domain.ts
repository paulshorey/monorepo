/**
 * Helper - Rate a domain, higher is better
 * @param domain {object}
 * @param domain.words {array}
 * @param domain.tld {string}
 * @param domain.string {string}
 * @param tlds_ratings {object} - dictionary of {[tld]: predetermined bonus points for that TLD}
 * @return {number}
 */
let DEBUG1 = false
let DEBUG3 = false
export default function (domain, tlds_ratings) {
  if (!domain.words || !domain.words[0]) {
  }
  if (domain.words[2] && domain.words[0] === domain.words[1]) {
    if (DEBUG3) global.cconsole.warn("first words the same", domain)
    return -10000
  }
  let last_i = domain.words.length - 1
  if (domain.words[last_i] && domain.words[last_i - 1] === domain.words[last_i]) {
    if (DEBUG3) global.cconsole.warn("last words the same", domain)
    return -10000
  }
  let rating = 0
  let sld = domain.words.join("")
  let sld_len = sld.length
  let total_len = sld_len + domain.tld.length
  let n_words = domain.words.length
  let first = domain.words[0]
  let first_f = first[0]
  let first_f2 = first[0] + first[1]
  let first_f3 = first[0] + first[1] + first[2]
  let first_l = first[first.length - 1]
  let first_l2 = first[first.length - 2] + first[first.length - 1]
  let first_syls = this.chunks_dicts[first]
  let first_rating = this.word_ratings[first] || 10 // maximum is 50
  let last = n_words > 1 ? domain.words[domain.words.length - 1] : ""
  let last_f = n_words > 1 ? last[0] : ""
  let last_f2 = n_words > 1 ? last[0] + last[1] : ""
  let last_f3 = n_words > 1 ? last[0] + last[1] + last[2] : ""
  let last_l = n_words > 1 ? last[last.length - 1] : ""
  let last_ll = n_words > 1 ? last[last.length - 2] : ""
  let last_l2 = n_words > 1 ? last[last.length - 2] + last[last.length - 1] : ""
  let last_rating = last ? this.word_ratings[last] || 10 : 0 // maximum is 50
  let tld = domain.tld
  let tld_f = tld[0]
  let tld_f2 = tld[0] + tld[1]
  let tld_f3 = tld[0] + tld[1] + tld[2]
  let tld_l = tld[tld.length - 1]
  let tld_l2 = tld[tld.length - 2] + tld[tld.length - 1]
  let tld_syls = this.chunks_dicts[tld]
  let tld_rating = tlds_ratings[tld]
  let word_rating = Math.max(first_rating, last_rating)
  rating += tlds_ratings[tld] || 1

  // too long
  if (sld_len > 20) {
    rating -= (sld_len - 20) * 10
  }

  // too short
  if (sld_len < 10) {
    rating -= (10 - sld_len) * (10 - sld_len) * 10
  }

  // don't like end prepositions
  if (first.length < 3 || last.length < 3) {
    rating -= 250
  }

  // perfer long single words
  if (!last && first.length >= 8) {
    rating += (first.length - 7) * 10
  }

  // demote if redundant
  if (first === last.substring(0, first.length)) {
    rating -= 500
  }

  // remove same word as domain
  if (last_f3 === tld_f3 || first_f3 === tld_f3) {
    rating -= 200
  }

  // prevent too much use of each word
  // for (let word of domain.words) {
  //   // if one of user input words, always allow
  //   if (this.chunks_dict[word]) {
  //     rating += 5
  //   } else {
  //     // if synonym, limit usage
  //     let used = word_used[word]
  //     // reset at 10
  //     if (used && used !== 10) {
  //       // subtract upto 100 points
  //       rating -= Math.min(used, 10) * 10
  //       word_used[word]++
  //     } else {
  //       word_used[word] = 1
  //     }
  //   }
  // }

  // demote if last word is singular version of key word
  // if (last && this.key_last_plural) {
  //   // singular
  //   let linfo = this.chunks_dicts[last]
  //   if (linfo) {
  //     if (linfo[5]) {
  //       // last is singular
  //       rating -= 100
  //     }
  //     if (linfo[4]) {
  //       // last is plural
  //       rating += 50
  //     }
  //   }
  // }

  // prefer higher tlds
  // let tld_bonus = Math.ceil((tld_rating / 1.5) * (tld_rating / 1.5))
  // rating += tld_bonus

  // avoid repetition
  if (first === tld) {
    rating -= 100
  }
  if (first === last) {
    rating -= 100
  }
  if (n_words === 2 && first_l === last_f) {
    rating -= 100
  }

  // prefer original words
  // contains original in domain name ? even if fragment or derivation ?
  let words_matched = 0
  for (let word of domain.words) {
    // original word ?
    // prefer it, but only once, so don't do it inside the for loop
    for (let key in this.chunks_dict) {
      let row = this.chunks_dict[key]
      if (!row || !row.key) continue
      let key_alt = row.singular || row.root || row.key
      if (
        word === row.key ||
        word === row.root ||
        word === row.plural ||
        word === row.singular ||
        word === row.abbreviation ||
        (key_alt.length >= 3 && word.includes(key_alt)) ||
        (word.length >= 3 && row.key.includes(word))
      ) {
        words_matched++
      }
    }
  }
  rating += words_matched * 5

  // contains word for word ?
  for (let key of [...this.keys_words, this.tld]) {
    if (domain.words.includes(key) || domain.tld === key) {
      rating += 50
    }
  }

  // promote desired TLDs
  if (tld === this.tld) {
    rating += 25
  }

  // promote ".com" with more words
  // if (tld === "com") {
  //   // global.cconsole.log(domain.string, n_words, ((n_words-1)*(n_words-1)*(n_words-1)*50))
  //   rating += (n_words - 1) * (n_words - 1) * (n_words - 1) * (n_words - 1) * 50 + 100
  //   // but fewer letters
  //   rating -= sld_len * sld_len
  // }

  // if single word input
  // if (this.keys_words.length === 1) {
  //   // perfect length
  //   if (sld_len >= 5 && sld_len <= 8 && tld.length >= 3 && tld.length <= 5) {
  //     rating += 15
  //   }
  //   if (sld_len === 7 && tld.length === 4) {
  //     rating += 10
  //   }
  // }

  // probably not available
  if (sld_len <= 4) rating -= 100
  if (sld_len <= 3) rating -= 100
  if (sld_len <= 2) rating -= 100
  // if (sld_len <= 4 && (tld === "com" || tld === "co" || tld === "io")) rating -= 250
  // if (sld_len <= 9 && tld === "com") rating -= 250

  // tld length
  if (tld.length >= 10) rating -= 25
  if (tld.length >= 12) rating -= 25

  /*
   *
   * alliteration
   *
   */
  let alliteration_bonus = Math.min(word_rating * 2, 75) + Math.min(tld_rating, 50)
  let total_alliteration_bonus = 0
  let cases = [
    [first, last],
    [first, tld]
  ]
  if (last && last !== first) {
    cases.push([last, tld])
  }
  for (let [first, last] of cases) {
    // must be different words!
    if (first !== last) {
      // first 1 letter
      if (n_words === 1 && first_f === tld_f) {
        total_alliteration_bonus += alliteration_bonus
      }
      if (n_words > 1 && first_f === last_f) {
        total_alliteration_bonus += alliteration_bonus
        // extra points if all 3 match
        if (first_f === tld_f) {
          total_alliteration_bonus += alliteration_bonus
        }
      }

      // last 1 letter
      if (first_l !== "s" && first_l !== "e") {
        if (n_words === 1 && first_l === tld_l) {
          total_alliteration_bonus += alliteration_bonus
        }
        if (n_words > 1 && first_l === last_l) {
          total_alliteration_bonus += alliteration_bonus
          // extra points if all 3 match
          if (first_l === tld_l) {
            total_alliteration_bonus += alliteration_bonus
          }
        }
      }

      // first 2 letters
      if (domain.string.length < 18) {
        if (n_words === 1 && first_f2 === tld_f2) {
          total_alliteration_bonus += alliteration_bonus
        }
        if (n_words > 1 && first_f2 === last_f2) {
          total_alliteration_bonus += alliteration_bonus
          // extra points if all 3 match
          if (first_f2 === tld_f2) {
            total_alliteration_bonus += alliteration_bonus
          }
        }
      }

      // last 2 letters
      if (domain.string.length < 18 && first_l !== "s") {
        if (n_words === 1 && first_l2 === tld_l2) {
          total_alliteration_bonus += alliteration_bonus
        }
        if (n_words === 2 && (first_l2 === last_l2 || last_l2 === tld_l2) && last_ll !== "e") {
          total_alliteration_bonus += alliteration_bonus
          // extra points if all 3 match
          if (first_l2 === tld_l2) {
            total_alliteration_bonus += alliteration_bonus
          }
        }
      }
    }
  }
  // apply alliteration bonus
  if (total_alliteration_bonus) {
    rating += Math.min(total_alliteration_bonus, 1000)
    if (DEBUG3) global.cconsole.log([domain.string, total_alliteration_bonus])
  }

  /*
   *
   * rhythm
   *
   */
  // same length as tld, or double
  if (sld_len.length === tld.length || sld_len.length === tld.length * 2) {
    rating += 50
  }

  /*
   *
   * one word
   *
   */
  if (n_words === 1) {
    // one word, same number of syllables as tld
    if (first_syls === tld_syls) {
      rating += 25
    }

    // short word
    if (first.length === 4 && tld.length <= 4) {
      rating += 40
    }
    if (first.length === 5 && tld.length <= 5) {
      rating += 30
    }
    if (first.length === 6 && tld.length <= 6) {
      rating += 20
    }
    if (first.length === 7 && tld.length <= 7) {
      rating += 10
    }

    // one word, same number of letters
    // if (first.length <= tld.length) {
    //   switch (tld.length) {
    //     case 4:
    //       rating += 30
    //       break
    //     case 5:
    //       rating += 25
    //       break
    //     case 6:
    //       rating += 20
    //       break
    //     case 7:
    //       rating += 15
    //       break
    //   }
    // }

    // good length
    if (first.length / tld.length === 1.5 || tld.length / first.length === 1.5) {
      rating += 10 + (50 - Math.min(50, total_len * 5)) // 5-letter word would get +10+25, 10-letter would get +10+0
    }
    if (first.length === 4 && tld.length === 4) {
      rating += 150
    }
    if (tld.length === 4) {
      rating += 20
    }
    if (tld.length === 3) {
      rating += 10
    }
    if (tld.length === 2) {
      rating += 30
    }

    // good rhythm
    if (first_syls / tld_syls === 2 || tld_syls / first_syls === 2) {
      rating += 10 + (50 - Math.min(50, total_len * 5)) // 5-letter word would get +10+25, 10-letter would get +10+0
    }
    if (first_syls === 4 && tld_syls === 3) {
      rating -= 20
    }
  } else {
    if (n_words === 2) {
      /*
       *
       * 2 words
       *
       */
      // good length
      if (first.length === last.length) {
        rating += 10
      }
    }
    /*
     *
     * 2+ words
     *
     */
    // short word + medium length
    // if (
    //   ((last.length === 3 || last.length === 4) && first.length > 6) ||
    //   ((first.length === 3 || first.length === 4) && last.length > 6)
    // ) {
    //   rating += 50
    // }
  }

  // prefer shorter
  // rating += 150
  // rating -= total_len * 5
  // rating -= n_words * 5

  // prefer n chars
  let prefer_n = 14
  // for every 1 char off, subtract 5
  let bonus_chars = 100 - Math.abs(total_len - prefer_n) * 10
  if (bonus_chars) {
    rating += bonus_chars
  }

  // prefer 2 words
  // for every 1 word off, subtract 25
  // let bonus_words = 50 - Math.abs(n_words - 2) * 25
  // rating += bonus_words

  // output
  if (DEBUG1)
    global.cconsole.info(
      `${Math.round(rating)} "${domain.words.toString()}.${tld}"`,
      first_rating,
      last_rating,
      "aa+" + Math.round(alliteration_bonus)
    )
  return rating
}
