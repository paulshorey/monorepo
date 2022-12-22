import key_sanitized from "./key_sanitized"
import contractions_dict from "@ps/nlp/data/words/dict/contractions"
import brands from "@ps/nlp/data/words/brands"
import names from "@ps/nlp/data/words/names"
import techterms from "@ps/nlp/data/words/tech"
import stopwords from "@ps/nlp/data/words/stopwords"
import fw from "@ps/nlp/data/words/fw/fw"
// import row_model from "@ps/nlp/api/endpoints/data.words/function/row_model"

/**
 * Adds row.str. Fixes row.acronym, row.proper, row.key
 * @param row {object} - DB row {key, dict, etc}
 *    REQUIRES: key, proper, ctr, acronym, str, abbreviation, singular, plural, root
 * @returns {object} - DB row {key, dict, pos_short, list, ok_list, sentiment, etc}
 */
// let DEBUG2 = false
export default function (row) {
  /*
   * key
   */
  row.key = key_sanitized(row.key)
  if (!row.pos1) {
    row.pos1 = "etc"
  }

  /*
   * reset
   */
  if (row.abbreviation) {
    if (row.abbreviation === "null") {
      row.abbreviation = ""
    } else if (row.abbreviation.substr(0, 5) === "null,") {
      row.abbreviation = row.abbreviation.substr(5)
    }
  }
  if (row.acronym) {
    if (row.acronym === "null") {
      row.acronym = ""
    } else if (row.acronym.substr(0, 5) === "null,") {
      row.acronym = row.acronym.substr(5)
    }
  }

  /*
   * in case abbreviation/acronym got mixed up
   */
  if (row.abbreviation && !row.acronym) {
    let abbrs = [row.abbreviation]
    if (row.abbreviation.includes(",")) {
      abbrs = row.abbreviation
        .split(",")
        .filter((str) => !!str)
        .map((str) => str.trim())
        .filter((str) => !!str)
    }
    for (let abbr of abbrs) {
      if (abbr.toLowerCase() === row.key) {
        row.acronym = abbr
        if (row.abbreviation === abbr) {
          row.abbreviation = ""
        }
      }
    }
  }

  /*
   * clean up
   */
  // if (row.abbreviation && !row.acronym) {
  //   row.acronym = row.abbreviation // made uppercase already
  //   row.abbreviation = ""
  // }
  if (row.singular && row.singular.toLowerCase() === row.key) {
    row.singular = ""
  }
  if (row.plural && row.plural.toLowerCase() === row.key) {
    row.plural = ""
  }
  if (row.root && row.root.toLowerCase() === row.key) {
    row.root = ""
  }

  /*
   * .list_count
   */
  if (row.list && typeof row.list === "string") {
    row.list = JSON.parse(row.list)
  }
  if (row.list && row.list.length) {
    row.list_count = row.list.length
  }

  /*
   * .word_count
   */
  row.word_count = row.key.split(" ").length
  row.char_count = row.key.length

  /*
   *
   *
   * name, brand, tech, etc.
   *
   *
   */
  row.name = false
  row.brand = false
  row.aux = false

  /*
   * brand ?
   */
  if (row.list_count < 15) {
    if (brands[row.key]) {
      row.brand = true
    }
    if (row.brand) {
      row.brand = true
      if (!row.singular && row.list_count < 15) {
        row.list_count = 15
      } else if (row.list_count < 5) {
        row.list_count = 5
      }
    }
  }

  /*
   *
   * name ?
   *
   */
  if (
    row.list_count >= 15 ||
    (row.key.length === 4 && row.list_count >= 10) ||
    (row.key.length <= 3 && row.list_count >= 5)
  ) {
    // skip name
  } else {
    // process name
    let test_name = row.key
    // detect plural name
    // if (row.key[row.key.length - 1] === "s") {
    //   row.singular = ''
    //   let ll = row.key.substr(row.key.length - 2, 1)
    //   let ll_is_consonant = !["a", "e", "i", "o", "u"].includes(ll)
    //   if (ll_is_consonant) {
    //     test_name = row.key.substr(0, row.key.length - 1)
    //     row.singular = test_name
    //   }
    // }
    // detect singular name
    if (names[test_name] || (test_name !== row.key && names[row.key])) {
      if (test_name.length > 3) {
        row.name = true
        if (row.sentiment === -1) {
          row.sentiment = 0
        }
      }
    }
    // is name
    if (row.name) {
      if (!row.singular && row.list_count < 15) {
        if (row.key.length >= 4) {
          row.list_count = 15
        }
      } else if (row.list_count < 5) {
        row.list_count = 5
      }
      row.proper = row.key.substring(0, 1).toUpperCase() + row.key.substring(1, row.key.length)
    }
  }

  /*
   * singular/plural
   */
  if (row.plural) {
    if (row.list_count < 5) {
      row.list_count = 5
    }
  }

  /*
   *
   * tech ?
   *
   */
  if (techterms[row.key]) row.tech = true
  else if (row.singular && techterms[row.singular]) row.tech = true
  else if (row.plural && techterms[row.plural]) row.tech = true
  else if (row.root && techterms[row.root]) row.tech = true
  else if (row.acronym && techterms[row.acronym]) row.tech = true

  /*
   *
   * stopword ?
   *
   */
  if (stopwords[row.key]) {
    /*
     * stopword list
     */
    row.brand = false
    row.name = false
    row.stop = true
    row.aux = true
    // if low quality word, fix
    if (row.list_count < 15) {
      row.list_count = 15
    }
  } else if (row.pos1 === "int") {
    /*
     * Interjection
     */
    row.brand = false
    row.name = false
    if (row.list_count < 20) {
      row.list_count = 20
    }
  } else if (["ctr", "con", "det", "pre", "pro"].includes(row.pos1)) {
    /*
     * Other auxillary word
     */
    row.brand = false
    row.name = false
    row.aux = true
    if (row.list_count < 5) {
      row.list_count = 5
    }
  }

  /*
   *
   * interrogative/aux fixes
   *
   */
  let fw_cat = fw[row.key]
  if (fw_cat) {
    /*
     * upgrade list_count
     */
    if (row.list_count < 24) {
      row.list_count = 24
    }
  }

  /*
   * fix acronym vs abbreviation
   */
  if (row.acronym) {
    if (row.acronym.includes(",")) {
      if (row.abbreviation) {
        row.abbreviation += "," + row.acronym
      } else {
        row.abbreviation = row.acronym
      }
      row.acronym = ""
    }
  } else {
    if (row.abbreviation && !row.abbreviation.includes(",")) {
      if (row.abbreviation.toUpperCase() === row.abbreviation) {
        row.acronym = row.abbreviation
        row.abbreviation = ""
      }
    }
  }

  /*
   * fix proper vs acronym
   */
  if (row.proper && row.acronym && row.acronym.toLowerCase() === row.key) {
    row.proper = ""
  }

  /*
   *
   * is digit
   *
   */
  if ((row.abbreviation && !isNaN(row.abbreviation)) || (row.key && !isNaN(row.key))) {
    row.aux = true
    row.list_count = row.list_count > 24 ? row.list_count : 24
    return row
  }

  /*
   * is NOT plural
   */
  if (row.name || row.proper) {
    row.plural = ""
  }

  /*
   * is singular, NOT root
   */
  if (row.root && row.singular && row.root === row.singular) {
    row.root = ""
  }

  /*
   * custom added
   */
  if (row.list_count < 15 && row.sentiment === 1) {
    row.list_count = 15
  }

  /*
   * fix pos1 length
   */
  if (!row.pos1) {
    global.cconsole.error("!pos1 " + row.key)
    row.pos1 = "etc"
    row.poss["etc"] = []
  }
  if (row.pos1.length > 3) {
    row.pos1 = row.pos1.substr(0, 3)
  }

  /*
   * has acronym
   */
  if (row.acronym && row.list_count < 15) {
    row.list_count = 15
  }

  /*
   * for chunking algorithm
   */
  if ((row.acronym || row.proper) && row.list_count < 5) {
    row.list_count = 5
  }
  // only upgrade "real" abbreviations, not reverse ones
  if (
    row.abbreviation &&
    (row.abbreviation.includes(",") || row.abbreviation.length < row.key.length) &&
    row.list_count < 5
  ) {
    row.list_count = 5
  }
  if (row.key.length === 1 && row.list_count > 5) {
    row.list_count = 5
  }
  if (row.key.length === 2 && row.list_count > 10) {
    row.list_count = 10
  }
  if (row.ctr && row.list_count < 25) {
    row.list_count = 25
  }
  if (row.key.length === 4 && row.key.substr(-1) === "e" && row.list_count < 15) {
    row.list_count = 15
  }

  /*
   * str
   */
  row.str = row.proper || row.key
  // str acronym
  if (row.acronym && row.acronym.toLowerCase() === row.key) {
    row.str = row.acronym
  }
  // str / ctr
  let ctr_tuple = contractions_dict[row.key]
  if (ctr_tuple) {
    row.ctr = ctr_tuple[0]
    row.str = ctr_tuple[0]
  } else if (row.str.includes("'")) {
    row.ctr = row.str
  }

  /*
   * done
   */
  return row
}
