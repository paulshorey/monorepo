import syllable_count from "@ps/fn/io/word/syllable_count"
// import { sort_strings_by_length_asc } from "@ps/fn/io/sort_strings"
// import fws from "@ps/nlp/data/words/fw/fw"
// import strings_shuffle_first_last_strict from "@ps/fn/io/strings/strings_shuffle_first_last2"

/**
 * Lists
 * @requires this.phrases {array} - list of strings, withOUT extension
 * @modifies this.domains {array} - extrapolated list of strings, WITH tld extensions added
 */
let DEBUG1 = false
export default function ({ words }) {
  /*
   * output
   */
  let hacks1 = [] // best quality ones, containing the full word
  let hacks2 = [] // lesser quality, with a letter or two removed
  /*
   * make word hacks from each synonym
   */
  if (DEBUG1) global.cconsole.info("make wordhacks from words: ", words)
  for (let word of words) {
    if (!word) continue
    // if (fws[word]) continue;
    // analyze
    let winfo = this.chunks_dicts[word] || []
    let wpos = winfo[9]
    let wsingular = winfo[4]
    word = wsingular || word
    let wlen = word.length
    if (wlen < 3 || wlen > 10 || word.includes(" ")) {
      continue
    }
    let fl = word[0]
    let fl_is_consonant = !["a", "e", "i", "o", "u"].includes(fl)
    let fl2 = word[1]
    let fl2_is_consonant = !["a", "e", "i", "o", "u"].includes(fl2)
    let ll = word[wlen - 1]
    let ll_is_consonant = !["a", "e", "i", "o", "u"].includes(ll)
    let ll2 = word[wlen - 2]
    let ll2_is_consonant = !["a", "e", "i", "o", "u"].includes(ll2)
    let ll3 = word[wlen - 3]
    let ll3_is_consonant = !["a", "e", "i", "o", "u"].includes(ll3)
    let wsyl = syllable_count(word)
    let word_ll = word.substring(0, wlen - 1) // word minus last letter

    /*
     * chop off "s"
     */
    // if (ll === "s" && !ll2_is_consonant) {
    //   add_wordhack(hacks1, word, word.substring(0, word.length - 1))
    // }

    /*
     * append "y"
     */
    if (ll2_is_consonant && wlen >= 4 && (fl_is_consonant || !fl2_is_consonant)) {
      if (["f", "j", "q", "x", "z"].includes(ll)) {
        add_wordhack(hacks1, word, word + "y")
      } else if (ll === "e" && wlen >= 6) {
        add_wordhack(hacks2, word, word_ll + "y")
      } else if (ll === "g" && wsyl === 1 && !ll2_is_consonant) {
        add_wordhack(hacks1, word, word + "gy")
      } else if (ll === "t" && wsyl === 1 && ll2_is_consonant) {
        add_wordhack(hacks1, word, word + "y")
      } else if (ll === "s" && ll2 === "s") {
        add_wordhack(hacks1, word, word + "y")
      } else if (ll === "r" && (wlen === 4 || wlen === 5)) {
        add_wordhack(hacks1, word, word + "y")
      } else if (ll === "p" && ll2 === "o") {
        add_wordhack(hacks1, word, word + "py")
      }
    }
    // else if (ll === "n" && !ll2_is_consonant) {
    //   add_wordhack(hacks2, word, word + "ny")
    // }

    /*
     * append new word "up"
     */
    if (ll_is_consonant && wpos === "ver" && wsyl === 1 && (wlen === 4 || wlen === 5)) {
      if (ll === "k" || ["se", "ve", "op", "up"].includes(ll2 + ll) || ["ump", "eet", "oot"].includes(ll3 + ll2 + ll)) {
        add_wordhack(hacks1, word, word + "up")
      }
    }

    /*
     * append "ed"
     */
    if (
      wpos === "ver" &&
      (["p", "c", "h", "k", "x", "y", "w", "z"].includes(ll) || (ll === "e" && ll2_is_consonant && ll2 !== "k"))
    ) {
      // gaze -> gazed
      if (ll === "e") {
        add_wordhack(hacks1, word, word + "d")
      }
      // creat ed, start ed, launch ed
      else {
        add_wordhack(hacks1, word, word + "ed")
      }
    }
    // else if (ll === "y" && ll2_is_consonant) {
    //   add_wordhack(hacks2, word, word_ll + "ed")
    // }

    /*
     * append "ify"
     */
    // if (word.substr(-4) === "ense") {
    //   add_wordhack(hacks2, word, word_ll + "ify")
    // }

    /*
     * append "k"
     */
    if (wlen > 3 && wlen < 6 && ll === "c" && !ll2_is_consonant) {
      add_wordhack(hacks1, word, word_ll + "k")
    }

    /*
     * append "i"
     */
    // if (wlen > 5 && wlen < 9 && (ll === "g" || ll === "k") && ll2_is_consonant) {
    //   add_wordhack(hacks1, word, word + "i")
    // }

    /*
     * append "ist"
     */
    if (wlen > 5 && word.substr(-3) === "est" && word.substr(-4) !== "iest") {
      add_wordhack(hacks1, word, word.substring(0, wlen - 3) + "ist")
    }

    /*
     * "culi nary" > "culi neer"
     */
    if (wlen > 5 && ll2 === "r" && ll === "y" && word.substr(-4) === "nary") {
      add_wordhack(hacks1, word, word.substring(0, wlen - 4) + "neer")
    }

    /*
     * append "a"
     */
    if (wlen >= 4 && wlen <= 6) {
      if (["b", "c", "d", "f", "j", "h", "i", "k", "q", "s", "u", "v", "x", "z"].includes(ll)) {
        if (!(ll === "h" && wsyl < 3)) {
          add_wordhack(hacks1, word, word + "a")
        }
      } else if (ll === "l" && ll2 === "e") {
        add_wordhack(hacks1, word, word + "la")
      } else if (ll === "t" && ll2 !== "p") {
        add_wordhack(hacks1, word, word + "a")
      } else if (ll === "2" && ll2 !== "a") {
        add_wordhack(hacks1, word, word + "a")
      }
    }

    /*
     * append "ly"
     */
    if (
      wlen >= 4 &&
      !ll2_is_consonant &&
      ["b", "d", "f", "g", "j", "i", "k", "l", "p", "q", "s", "t", "u", "v", "z"].includes(ll)
    ) {
      add_wordhack(hacks1, word, word + "ly")
    } else if (ll === "e" && ll2 === "l" && wlen >= 6) {
      add_wordhack(hacks1, word, word_ll + "y")
    } else if (ll === "e" && ll2_is_consonant && wlen >= 6) {
      add_wordhack(hacks1, word, word + "ly")
    }
    // if (ll === "y" && ll2_is_consonant) {
    //   add_wordhack.call(this,hacks1, word, word_ll + "ily")
    // }

    /*
     * append "o"
     */
    if (wlen >= 4) {
      if (["b", "c", "f", "j", "i", "p", "q", "t", "u", "v", "x", "z"].includes(ll)) {
        add_wordhack(hacks1, word, word + "o")
      } else if (wlen >= 6 && ll === "a") {
        add_wordhack(hacks2, word, word_ll + "o")
      } else if (wlen === 3 && ["s", "w"].includes(ll)) {
      } else if (ll === "k" && !ll2_is_consonant) {
        add_wordhack(hacks1, word, word + "o")
      }
    }

    /*
     * append "io"
     */
    if (wlen >= 4 && ["d", "f", "j", "k", "m", "p", "q", "t", "v", "x", "z"].includes(ll)) {
      if (ll2 + ll !== "sk") {
        add_wordhack(hacks1, word, word + "io")
      }
    } else if (wlen >= 6 && (ll === "a" || ll === "i") && ll2_is_consonant) {
      add_wordhack(hacks2, word, word_ll + "io")
    } else if (wlen >= 4 && ll === "b" && ll2 !== "m") {
      add_wordhack(hacks1, word, word + "io")
    } else if (wlen >= 4 && ll === "g" && wsyl === 1) {
      if (ll2 === "g") {
        add_wordhack(hacks1, word, word + "gio")
      } else {
        add_wordhack(hacks1, word, word + "io")
      }
    } else if (wlen >= 6 && ll === "y" && ll2_is_consonant) {
      add_wordhack(hacks2, word, word_ll + "io")
    } else if (wlen >= 6 && ll === "h" && ll2 !== "a" && ll2 !== "t") {
      add_wordhack(hacks1, word, word + "io")
    }

    /*
     * append "ing"
     */
    appending: if (
      ll !== "c" &&
      (wpos === "nou" || wpos === "ver") &&
      (ll_is_consonant || (ll === "y" && ll2_is_consonant))
    ) {
      // gaze -> gazing
      if (ll === "e") {
        add_wordhack(hacks2, word, word_ll + "ing")
      }
      // miss + ing
      // wax + ing
      // cry + ing
      else if (ll === ll2 || ["x", "w", "c"].includes(ll)) {
        if (ll === "t" && wlen > 5) break appending
        add_wordhack(hacks1, word, word + "ing")
      } else if (["n"].includes(ll)) {
        add_wordhack(hacks2, word, word + ll + "ing")
      }
      // else if (ll === "y" && ll3 !== ll2 && !["n", "m"].includes(ll2)) {
      //   // remove 'y', add 'ing'
      //   add_wordhack(hacks2, word, word_ll + "ing")
      // }
      // clap + ling
      // else {
      //   add_wordhack(hacks1, word, word + "ling")
      // }
    }

    /*
     * append "us"
     */
    if (ll === "c" || ll === "b") {
      // extra space, so it will be rated lower (by length)
      add_wordhack(hacks1, word, word + "us")
    }

    /*
     * replace "ge" with "j"
     */
    if (ll2 + ll === "ge" && !ll3_is_consonant) {
      // extra space, so it will be rated lower (by length)
      add_wordhack(hacks1, word, word.substring(0, word.length - 2) + "j")
    }
  }

  // shuffle, slice, output
  this.word_hacks = [...new Set([...hacks1, ...hacks2])].slice(0, 20)
  if (DEBUG1) global.cconsole.log("this.word_hacks", this.word_hacks)

  //
}

function add_wordhack(list, word, hack) {
  list.push(hack)
}
