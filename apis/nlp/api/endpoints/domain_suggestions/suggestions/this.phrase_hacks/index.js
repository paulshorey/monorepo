// import { arrays_mix } from "@techytools/fn/io/arrays"
import syllable_count from "@techytools/fn/io/str/str_syllables_count"
/*
 * IDEAS to add:
 * un____
 * _____i
 */
/**
 * Replace each word in a phrase, X timesover.
 *        X = 2/3 of the number of 1st POS synonyms of that word
 *        `Math.floor(row.poss[row.pos1].length * 0.67)`
 * @returns {array} array - array of arrays (each child array value is a word)
 */
let DEBUG1 = false
export default function () {
  let { string_original, string, keys_words, chunks_dict } = this
  let phrases1 = []
  let phrases2 = []
  let phrases3 = []
  let str_phrase = keys_words.length > 1 ? string_original : ""
  let str_word = str_phrase || ""
  if (keys_words[0] && chunks_dict[keys_words[0]] && chunks_dict[keys_words[0]].pos1 === "nou") {
    str_word = keys_words[0]
  }
  let str_row = chunks_dict[this.best1 || str_word || str_phrase]
  if (!str_row) {
    str_row = chunks_dict[keys_words[0]] || {}
  }
  let str_word_row = chunks_dict[str_word]
  let str_word_pos = str_word_row ? str_word_row.pos1 : ""
  let str_word_ll = str_word ? str_word[str_word.length - 1] : ""
  let str_word_fl = str_word ? str_word[0] : ""
  // let str_word_fl_is_consonant = str_word_fl ? !["a", "e", "i", "o", "u"].includes(str_word_fl) : false
  let str_word_syls = str_word ? syllable_count(str_word) : 10
  let str_name = typeof this.is_name === "string" ? this.is_name : (this.is_name && str_word) || ""
  if (str_row.name && str_row.singular) {
    str_name = str_row.singular
  }
  let str_name_ll = str_name ? str_name[str_name.length - 1] : ""
  let str_tech = typeof this.is_tech === "string" ? this.is_tech : (this.is_tech && str_word) || ""
  let str_tech_ll = str_tech ? str_tech[str_tech.length - 1] : ""
  let str_brand = typeof this.is_brand === "string" ? this.is_brand : (this.is_brand && str_word) || ""
  let str_brand_ll = str_brand ? str_brand[str_brand.length - 1] : ""
  let str_food = typeof this.is_food === "string" ? this.is_food : (this.is_food && str_word) || ""
  let str_plural = ""
  if (str_row) {
    if (str_row.plural) {
      str_plural = str_row.plural
    } else if (str_row.singular) {
      str_plural = str_row.key
    }
  }
  let str_plural_syls = str_plural === str_plural ? syllable_count(str_plural) : 10
  let arr_food = str_food.split(" ")
  let arr_tech = str_tech.split(" ")
  let arr_brand = str_brand.split(" ")
  /*
   * food
   */
  if (str_food) {
    phrases1.push([...arr_food, "now"])
    phrases1.push([...arr_food, "box"])
    phrases1.push([...arr_food, "cafe"])
    phrases1.push(["best", ...arr_food])
    phrases2.push(["yummy", ...arr_food])
    phrases3.push(["eat", ...arr_food])
  }
  /*
   * tech
   */
  if (str_tech) {
    phrases1.push(["the", ...arr_tech])
    phrases2.push(["get", ...arr_tech])
    phrases1.push([...arr_tech, "app"])
    phrases2.push(["best", ...arr_tech])
    phrases2.push([...arr_tech, "tech"])
    phrases2.push([...arr_tech, "now"])
    phrases2.push(["i", ...arr_tech])
  }
  /*
   * name
   */
  if (str_name) {
    phrases1.push(["hello", str_name])
    phrases1.push([str_name, "solutions"])
    phrases2.push(["go", str_name])
    phrases2.push(["meet", str_name])
    phrases2.push([str_name + "s", "page"])
    phrases2.push([str_name, "center"])
    phrases3.push(["i", "am", str_name])
    phrases3.push([str_name + "s", "blog"])
    phrases3.push([str_name, "is", "here"])
    phrases3.push([str_name, "time"])
    phrases3.push([str_name, "now"])
  }
  /*
   * brand
   */
  if (str_brand) {
    phrases1.push([...arr_brand, "group"])
    phrases1.push(["get", ...arr_brand])
    phrases1.push(["try", ...arr_brand])
    phrases1.push([...arr_brand, "app"])
    phrases1.push([...arr_brand, "inc"])
    phrases2.push(["use", ...arr_brand])
    phrases2.push(["the", ...arr_brand])
    phrases2.push([...arr_brand, "now"])
    phrases2.push(["my", ...arr_brand])
    phrases2.push([...arr_brand, "design"])
    phrases2.push([...arr_brand, "works"])
    phrases2.push([...arr_brand, "collective"])
    phrases3.push([...arr_brand, "llc"])
    phrases3.push([...arr_brand, "hq"])
  }
  /*
   * normal word or phrase
   */
  if (!this.is_name && !this.is_brand && !this.is_food && !this.is_tech) {
    /*
     * single word
     */
    if (str_word) {
      /*
       * noun
       */
      if (str_word_pos === "nou") {
        phrases2.push(["the", str_word])
        phrases2.push(["best", str_word])
        if (str_word.length >= 6) {
          phrases2.push([str_word, "hq"])
        }
      }
      /*
       * 1-syllable, not tech
       */
      if (str_word_syls === 1 && !this.is_tech) {
        /*
         * i+
         */
        if (str_word_pos === "nou" || str_word_pos === "ver") {
          phrases3.push(["i", str_word])
          phrases2.push(["my", str_word])
        }
        /*
         * verb
         */
        if (str_word_pos === "ver") {
          phrases3.push([str_word, "it"])
          phrases3.push([str_word, "me"])
        }
        /*
         * double word
         */
        phrases2.push([str_word, str_word])
      }
      /*
       * noun
       */
      if (str_word_pos === "nou" || str_word_pos === "pro") {
        /*
         * 1-2-syllable
         */
        if (str_plural && str_plural_syls <= 2) {
          phrases3.push(["i", "love", str_plural])
          phrases3.push(["we", "love", str_plural])
          phrases2.push(["buy", str_word])
          phrases2.push(["hello", str_word])
        }
        /*
         * 1-syllable
         */
        if (str_word_syls === 1) {
          phrases2.push([str_word, "club"])
          phrases3.push([str_word, "friends"])
          if (this.is_tech) {
            phrases2.push([str_word, "box"])
            phrases3.push([str_word, "cube"])
            phrases1.push([str_word, "cloud"])
          } else {
            phrases2.push([str_word, "world"])
            phrases3.push([str_word, "planet"])
            phrases2.push([str_word, "land"])
          }
          phrases2.push([str_word, "society"])
          phrases3.push(["pretty", str_word])
        }
        /*
         * 2-3-syllable
         */
        if (str_word_syls === 2 || str_word_syls === 3) {
          /*
           * club society
           */
          phrases3.push(["the", str_word, "society"])
        }
        /*
         * 2-syllable, not tech
         */
        if (str_word_syls <= 2) {
          phrases3.push(["great", str_word])
          phrases3.push(["love", str_word])
        }
        /*
         * 1-2-3-syllable, not tech
         */
        if (str_word_syls <= 3) {
          phrases1.push(["best", str_word])
          phrases1.push(["top", str_word])
          // phrases3.push(["super", str_word])
          phrases1.push(["get", str_word])
          phrases2.push(["the", str_word])
          phrases3.push(["buy", str_word])
        }
      }
    } else {
      /*
       * phrase / multiple words
       */
      /*
       * interrogative
       */
      if (this.is_about_nou || this.is_about_ver) {
        // ____ 101
        phrases1.push([this.is_about_nou || this.is_about_ver, "101"])
        // about ____
        if (this.is_about_nou) {
          phrases1.push(["about", this.is_about_nou])
        }
        // about ____ing
        if (this.is_about_ver) {
          let gerund = ""
          let str = this.is_about_ver
          let str_len = str.length
          let str_ll = str[str_len - 1]
          if (str.substr(0, str_len - 3) === "ing") {
            gerund = str
          } else if (str_ll !== "s") {
            gerund = str.substring(0, str_len - 1) + "ing"
          } else {
            gerund = str + "ing"
          }
          global.cconsole.error(`gerund of "${str}" is "${gerund}" ?`)
          phrases3.push(["about", gerund])
        }
      }
      /*
       * simply append/prepend words
       */
      if (str_phrase.length < 10) {
        phrases3.push(["get", str_phrase])
        phrases3.push(["try", str_phrase])
        phrases3.push(["about", str_phrase])
        phrases3.push(["the", str_phrase])
        phrases3.push(["best", str_phrase])
        phrases3.push(["our", str_phrase])
        phrases3.push(["your", str_phrase])
        phrases3.push(["my", str_phrase])
        phrases3.push(["i", str_phrase])
        phrases3.push([str_phrase, "cloud"])
        phrases3.push([str_phrase, "online"])
        phrases3.push([str_phrase, "tech"])
        phrases3.push([str_phrase, "now"])
        phrases3.push([str_phrase, "llc"])
        phrases3.push([str_phrase, "time"])
        phrases3.push([str_phrase, "box"])
        phrases3.push(["love", str_phrase])
        phrases3.push([str_phrase, "group"])
        phrases3.push([str_phrase, "solutions"])
        phrases3.push([str_phrase, "services"])
        phrases3.push([str_phrase, "studio"])
        phrases3.push([str_phrase, "gallery"])
        phrases3.push([str_phrase, "house"])
        phrases3.push([str_phrase, "today"])
        phrases3.push([str_phrase, "works"])
      }
      if (str_phrase.length >= 6) {
        phrases3.push([str_phrase, "hq"])
      }
    }
  }
  /*
   * only consonants
   */
  if (str_word && str_word.length > 3 && str_word.length < 15) {
    let str = str_word
    let new_str = ""
    for (let ch of str) {
      if (!["a", "e", "i", "o", "u", "y"].includes(ch)) {
        new_str += ch
      }
    }
    if (new_str && new_str.length >= 3 && new_str.length <= 5) {
      phrases3.push([new_str])
    }
  }
  /*
   * log
   */
  if (DEBUG1) global.cconsole.log("original plus 1", phrases1)
  if (DEBUG1) global.cconsole.log("original plus 2", phrases2)
  if (DEBUG1) global.cconsole.log("original plus 3", phrases3)
  /*
   * output
   */
  if (phrases1.length || phrases2.length) {
    this.phrase_hacks = [...phrases1, ...phrases2, ...phrases3]
    // this.phrase_hacks = [...new Set([...phrases1, ...phrases2, ...phrases3])]
  }
}
