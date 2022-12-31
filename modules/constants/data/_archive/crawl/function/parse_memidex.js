const convert_to_english = require("/data/words/function/convert_to_english.js")
const { phrase_capitalize } = require("pauls-pure-functions/word/functions/pos.js")

module.exports = function ($) {
  /**
   *
   * LIB...
   *
   */
  function clog(obj) {
    if (obj instanceof Object) {
      obj = freeze(obj)
    }
    console.log(obj)
  }

  function freeze(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  String.prototype.toCapitalized = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
  }

  function sanitizeInputWord(word) {
    return word.replace(/[.']/, "").replace(/]/g, "];").replace(/[()]+/gi, "").trim()
  }

  function firstSyllable(word) {
    // if y'all, then only one letter has to match
    if (word.indexOf("'") !== -1) {
      return word.substr(0, word.indexOf("'"))
    }
    // find first real syllable
    let firstA = 0
    let secondA = 0
    Array.from(word).forEach(function (letter, index) {
      // if vowel,
      if (letter === "a" || letter === "e" || letter === "i" || letter === "o" || letter === "u" || letter === "y") {
        // if first vowel in word, but skip if it is first letter in word
        if (!firstA) {
          if (index > 0) {
            firstA = index
          }
        } else {
          // if second vowel in word, cut the syllable there
          return word.substr(0, index)
        }
      }
    })
    // if did not find second vowel, return entire word
    return word
  }

  function minLen(word) {
    return /[a-z]{2,}/i.test(word)
  }

  function mapWords(word) {
    // remove parentheses
    const i_parentheses = word.indexOf("(")
    if (i_parentheses > 0) {
      word = word.substr(0, i_parentheses)
    }
    // remove disambiguation
    const i_disambiguation = word.toLowerCase().indexOf("disambiguation")
    if (i_disambiguation > 0) {
      word = word.substr(0, i_disambiguation)
    }
    // return
    word = convert_to_english(word)
    return (
      word
        .trim()

        // starts/ends with:
        .replace(/[,']$/, "")
        .replace(/^[,']/, "")
        .replace(/\*$/, "-")
        .replace(/^\*/, "-")

        // in middle:
        .replace(/[.]/, "-")

        // remove ending white space
        .trim()
    )
  }

  function filterWord_minLengthThis(word) {
    // return {true} if OK
    if (word.length < this.minLength || word.length > 33) {
      return false
    }
    // remove words that start/end with -
    if (word.substr(0, 1) === "-" && word.substr(-1) === "-") {
      return false
    }
    // remove words which appear in THIS.sensesToIgnore
    let textToIgnore = JSON.stringify(THIS.sensesToIgnore)
    textToIgnore = textToIgnore.replace(/"[\w]+":/g, "")
    if (textToIgnore.indexOf('"' + word + '"') !== -1) {
      return false
    }
    // in toDelete, marked for deletion
    if (
      THIS.toDelete.includes(word) &&
      this.type !== "gerunds" &&
      this.type !== "keys" &&
      this.type !== "roots" &&
      this.type !== "plurals"
    ) {
      return false
    }
    // default ok
    return true
  }

  function filterWord_removeThis(word) {
    // remove -starting ending- dashes
    if (word.substr(0, 1) === "-" || word.substr(-1) === "-") {
      return false
    }
    // filter out the keyword/root/plural
    return word + " " !== this.key + " "
  }

  function sortByFrequencyLength(array) {
    let frequency = {}

    array.forEach(function (value) {
      frequency[value] = 0
    })

    let uniques = array.filter(function (value) {
      return ++frequency[value] === 1
    })

    return uniques.sort(function (a, b) {
      return frequency[b] - frequency[a]
    })
  }

  function wd_sense({ key, pos, element }) {
    // this ~== sense
    this.keys.push(key)

    /**
     * Note:
     * ${this} is the model of a sense
     * for example, this = { derivations: [], synonyms: [], types: [] }
     */
    let type = ""

    element.children().each((i, liElement) => {
      var $liElement = $(liElement)
      var txts = ""
      var $small = $liElement.find("small")
      // each content can be a <textNode> or <b>:
      $small.contents().each((i, el) => {
        var $el = $(el)
        var txt = sanitizeInputWord($el.text())
        txts += ";" + txt + ";"
      })
      var words = txts.split(";")
      for (let txt of words) {
        txt = txt.replace(/,/g, "").trim()
        if (txt.length < 2) {
          continue
        }

        if (txt.indexOf("Synonyms:") !== -1 || txt.indexOf("to:") !== -1) {
          // "to:" // synonyms
          type = "synonyms"
        } else if (txt.indexOf("Topic:") !== -1 || txt.indexOf("of:") !== -1) {
          // "of:" // types
          type = "types"
        } else if (txt.indexOf("eriv") !== -1 || txt.indexOf("from:") !== -1) {
          // "Derived from:"
          type = "derivations"
        } else if (txt.indexOf(":") !== -1) {
          // Other ":" will be ignored
          type = ""
          console.warn('Unexpected ":" = "' + txt + '"')
        } else if (txt && type && this[type]) {
          // [description]
          if (txt.indexOf("[") !== -1) {
            // console.warn('[txt](' + type + ')', txt);
            let match = txt.match(/\[(\w+)\]/)
            if (match && match[1]) {
              // find value AFTER the word, IN BRACKETS [abbreviation]
              // value modifier
              if (match[1] === "abbreviation") {
                // if [abbreviation] or [Capitalized]
                if (type && this[type] && this[type].length) {
                  // remove previously added word, add to derivations
                  let word = this[type].pop()
                  if (word) {
                    // if word word exists and current "[" is "abbreviation"...
                    if (word.substr(0, 1).toLowerCase() === THIS.key.substr(0, 1).toLowerCase()) {
                      this.derivations.push(word)
                    }
                  }
                }
              }
            }
          } else {
            // sense[derivations|synonyms|types]
            this[type].push(txt)
          }
        }
      }

      // definitions
      var type = $liElement.find("a").text()
      var small = $liElement.find("small").text()
      var defs = $liElement.text().replace(type, "").replace(small, "").trim().split(";")
      for (const def of defs) {
        this.definitions.push(def)
      }
    })
  }

  /**
   *
   * MODEL...
   *
   */
  // first, parse page into this format
  function senseModel() {
    return {
      "propers": [],
      "abbreviations": [],
      "3rd-person": [],
      "gerunds": [],
      "plurals": [],
      "roots": [],
      "derivations": [],
      "synonyms": [],
      "definitions": [],
      "types": [],
      "keys": []
    }
  }

  var THIS = {
    toDelete: [],
    //
    // Search term
    key: "",
    sense: "",
    root: "",
    plural: "",
    abbr: "",
    proper: "",
    //
    // Related words:
    // (Sort: compare JSON.stringified lengths of each object. Delete lowest scored)
    senses: {
      adverbs: { ...senseModel() },
      adjectives: { ...senseModel() },
      verbs: { ...senseModel() },
      nouns: { ...senseModel() },
      interjections: { ...senseModel() },
      conjunctions: { ...senseModel() },
      pronouns: { ...senseModel() },
      prepositions: { ...senseModel() },
      determiners: { ...senseModel() },
      etc: { ...senseModel() }
    },
    //
    // Un-related words:
    sensesToIgnore: {
      adverbs: { ...senseModel() },
      adjectives: { ...senseModel(), propers: [] },
      verbs: { ...senseModel() },
      nouns: { ...senseModel(), propers: [], plurals: [] },
      interjections: { ...senseModel() },
      conjunctions: { ...senseModel() },
      pronouns: { ...senseModel() },
      prepositions: { ...senseModel() },
      determiners: { ...senseModel() },
      etc: { ...senseModel() }
    },
    //
    // Alternative spellings/uses of the word:
    // (Sort: compare lengths of each array. Delete lowest scored)
    derivations: {
      "adverb": [],
      "adjective": [],
      "pronoun": [],
      "verb": [],
      "noun": [],
      "determiner": [],
      "interjection": [],
      "abbreviation": [],
      "contraction": [],
      "conjunction": [],
      "preposition": [],
      "derived": [],
      "sense": [],
      "etc": [],
      "plural": [], // noun
      "comparative": [], // adjective
      "superlative": [], // adjective
      "past participle": [], // verb
      "present participle": [], // verb
      "past tense": [], // verb
      "present tense": [], // verb
      "future tense": [], // verb
      "3rd-person": [], // verb
      "bold": [] /* temporary: holds <h4> <b> strings until we know what THIS.sense to assign them to */
    }
  }

  /**
   *
   * OUTPUT
   *
   */
  const output = (function () {
    // first, remove fragments, like the elipsed last word in a long line of synonyms
    // ex: memidex.com/camper returns synonym "motor" because html has <b>motor</b>...
    var replaced = $("body")
      .html()
      .replace(/(<b>)?[a-z]+(<\/b>)?\.\.\./gi, "")
    // remove abbreviations with period, like "theat." for "theater"
    // because they're usually not good
    replaced = replaced.replace(/[a-z]+\./gi, "")
    $("body").html(replaced)

    // THIS.key
    $("#sw h1, #wd h1").each(function (i, el) {
      var $el = $(el)
      let txt = $el.text()
      THIS.key = mapWords(txt)
    })

    // TOP SUMMARY OF SENSES
    if ($("#wd").length) {
      // SENSES
      var senses_pos = "etc"
      var senses_key = ""
      $("#wd > *").each(function (i, olul) {
        var $olul = $(olul)
        var tag = $olul.prop("tagName").toLowerCase()
        var txt = $olul.text().trim()

        // Parse each child element of #wd. Each tag has different content:
        switch (tag) {
          case "h1":
          case "h2":
            if (txt.indexOf(".") === -1) {
              senses_key = txt
            } else {
              senses_key = ""
            }
            return
          case "h3":
            senses_pos = txt || "etc"
            return
          case "ol":
          case "ul":
            if (senses_key) {
              const pos = senses_pos + "s"
              // if already did 1 pos, STOP
              // don't add multiple senses of same pos
              if (
                THIS.senses[pos].derivations.length ||
                THIS.senses[pos].definitions.length ||
                THIS.senses[pos].synonyms.length ||
                THIS.senses[pos].types.length
              ) {
                wd_sense.bind(THIS.sensesToIgnore[pos])({ key: senses_key, pos: pos, element: $olul })
                return
              }
              // parse each text
              wd_sense.bind(THIS.senses[pos])({ key: senses_key, pos: pos, element: $olul })
            }
            return
          default:
            break
        }
      })

      // SENSE
      $wdh3 = $("#wd h3").first()
      if ($wdh3.length === 1) {
        const sense = $wdh3.text().trim()
        if (sense) {
          THIS.sense = $wdh3.text().trim() + "s"
        } else {
          throw new Error("unexpected sense = $wdh3.text().trim() === " + sense)
        }
      }
    }

    // TOP SUMMARY - parse THIS.sense
    let foundThisSense = false
    $("#sw .t .r").each(function (i, el) {
      if (foundThisSense) {
        return
      }
      const $el = $(el)
      let txt = $el.text()

      // CLASS
      if (txt.indexOf("Class:") !== -1) {
        // wrapper function, so we can "break" from a "for" loop inside another "for" loop
        ;(function () {
          // find first sense
          const $p = $el.find("p")
          $p.find("small").remove()
          // each sense phrase, separated by "|"
          let list = $p.text().split("|")
          for (const phrase of list) {
            let list = phrase.split(" ")
            // each word in class phrase, separated by " ":
            for (const word of list) {
              // check pluralized word
              let txt = word.trim() + "s"
              // special cases
              if (txt === "exclamations") {
                txt = "interjections"
              }
              if (THIS.senses[txt]) {
                THIS.sense = txt
                // done! capish?
                return
              }
            }
          }
        })()
      }

      // got some! Stop looking
      if (THIS.sense) {
        foundThisSense = true
      }
    })

    // DELETE Wikipedia
    // IDK, Cheerio is buggy !! $('#r > * > *') == $('#r')
    $("#r > * > *").each(function (i, el) {
      const $el = $(el)
      const $h3 = $el.find("h3")
      if ($h3.length && $h3.text().includes("Wikipedia:")) {
        $el.html($el.html().toLowerCase())
      }
    })

    // TOP SUMMARY OF (ONE) SENSE
    if ($("#sw").length) {
      // THIS.sense
      // if none defined in #sw, but still only one sense on page (#sw, not #wd)
      if (!THIS.sense) {
        var conjunctions = THIS.derivations.conjunction
        var interjections = THIS.derivations.interjection
        var pronouns = THIS.derivations.pronoun
        var nouns = THIS.derivations.plural
        var adverbs = THIS.derivations.adverb
        var adjectives = [...THIS.derivations.comparative, ...THIS.derivations.superlative]
        var verbs = [
          ...THIS.derivations["3rd-person"],
          ...THIS.derivations["past participle"],
          ...THIS.derivations["present participle"],
          ...THIS.derivations["present tense"],
          ...THIS.derivations["past tense"],
          ...THIS.derivations["future tense"]
        ]
        if (pronouns.length) {
          THIS.sense = "pronouns"
        } else if (interjections.length) {
          THIS.sense = "interjections"
        } else if (conjunctions.length) {
          THIS.sense = "conjunctions"
        } else if (adverbs.length) {
          THIS.sense = "adverbs"
        } else if (nouns.length) {
          THIS.sense = "nouns"
        } else if (adjectives.length) {
          THIS.sense = "adjectives"
        } else if (verbs.length) {
          THIS.sense = "verbs"
        } else {
          THIS.sense = "etc"
        }
      }

      // singular derivation
      // this page is plural, use conversion to singular
      var singularized = $("#sw p.j b a").text().trim()
      if (singularized) {
        THIS.senses[THIS.sense].derivations.unshift(singularized)
      }

      // parse each
      $("#sw .t .r").each(function (i, el) {
        let $el = $(el)
        let txt = $el.text()

        // DEFINITION
        if (txt.indexOf("Definition:") !== -1) {
          var def = $el.find("p").text().trim()
          if (def) {
            THIS.senses[THIS.sense].definitions.push(def)
          }
        }

        // CLASS
        else if (txt.indexOf("Class:") !== -1) {
          // TYPES
          let $type = $el.find("p small")
          if ($type.length) {
            let txt = $type.text().replace(/[()]/g, "").trim()
            if (txt) {
              THIS.senses[THIS.sense].types.push(txt)
            }
          }
        }

        // TYPE
        else if (txt.indexOf("Examples:") !== -1) {
          $el.find("p a").each(function (i, el) {
            let $el = $(el)
            let txt = $el.text().trim()
            if (minLen(txt) && txt.length < 22) {
              THIS.senses[THIS.sense].synonyms.push(txt)
            }
          })
        }

        // TYPE
        else if (txt.indexOf("Type of:") !== -1 || txt.indexOf("of:") !== -1) {
          $el.find("p a").each(function (i, el) {
            let $el = $(el)
            let txt = $el.text().trim()
            if (minLen(txt) && txt.length < 22) {
              THIS.senses[THIS.sense].types.push(txt)
            }
          })
        }

        // PLURAL
        else if (txt.indexOf("Plural:") !== -1) {
          $el.find("p").each(function (i, el) {
            let $el = $(el)
            let txt = $el.text().trim()
            if (minLen(txt) && txt.length < 22) {
              THIS.senses[THIS.sense].plurals.push(txt)
            }
          })
        }

        // DERIVATIVES
        else if (
          txt.indexOf("from:") !== -1 ||
          txt.indexOf("Derivative:") !== -1 ||
          txt.indexOf("Related to:") !== -1 ||
          txt.indexOf("Comparative:") !== -1 ||
          txt.indexOf("Superlative:") !== -1
        ) {
          $el.find("p a").each(function (i, el) {
            let $el = $(el)
            let txt = $el.text().trim()
            if (minLen(txt) && txt.length < 22) {
              THIS.senses[THIS.sense].derivations.push(txt)
            }
          })
        }

        // SYNONYMS
        else if (txt.indexOf("Synonyms:") !== -1 || txt.indexOf("to:") !== -1) {
          $el.find("p a").each(function (i, el) {
            let $el = $(el)
            let txt = $el.text().trim()
            if (minLen(txt) && txt.length < 22) {
              THIS.senses[THIS.sense].synonyms.push(txt)
            }
          })
        }
      })
    }

    // BOLD
    // (also REMOVE unrelated H4's)
    $("#r .r h4:first-child").each(function (bE, section) {
      let $section = $(section)
      let $boldElement = $($($section.eq(0)).find("b").eq(0))

      let bold = sanitizeInputWord($boldElement.text())

      if (bold.includes("|")) {
        bold = bold.substr(0, bold.indexOf("|")).trim()
      }
      if (!bold) {
        return
      }
      if (bold.includes("[")) {
        bold = bold.substr(0, bold.indexOf("[")).trim()
      }

      // check if $('h4 b').text() appears in each sense
      var appearsIn = false
      for (const pos in THIS.senses) {
        const senseTxt = JSON.stringify(THIS.senses[pos]).toLowerCase()
        if (
          senseTxt.indexOf('"' + bold.toLowerCase() + "") !== -1 ||
          senseTxt.indexOf("" + bold.toLowerCase() + '"') !== -1
        ) {
          appearsIn = true
        }
      }
      // check if bold text is similar to key
      if (minLen(bold)) {
        if (
          THIS.key.toLowerCase().indexOf(bold) !== -1 || // if bold appears in key
          bold.indexOf(THIS.key.toLowerCase()) !== -1 || // if key appears in bold
          THIS.key.toLowerCase().indexOf(bold.substr(0, 3)) === 0 // if first 3 letters of bold are first 3 letters of key
        ) {
          // ok
          appearsIn = true
        }
      }

      // check if bold text is similar to key
      if ($section.text().includes("wikipedia.org/wiki/")) {
        // ok
        appearsIn = false
      }

      // pop quiz!...
      // if one is much longer than the other, then first 3 characters have to match
      if (Math.abs(THIS.key.length - bold.length) > 3) {
        if (THIS.key.substr(0, 3).toLowerCase() !== bold.substr(0, 3).toLowerCase()) {
          appearsIn = false
        }
      }

      // remove result
      if (
        !appearsIn &&
        [...THIS.derivations.sense, ...THIS.derivations["past tense"], ...THIS.derivations.plural].length > 10
      ) {
        $section.remove()
      } else {
        // if not removed, then it must be a good derivation
        THIS.derivations.bold.push(bold)
      }
    })

    // DERIVATIONS [type
    // <div id="r"> <h4> <textNode> [plural] [3rd-person] [superlative]
    $("#r h4, #wd li small, #etymology h4").each(function (i, h4) {
      let $h4 = $(h4)
      $h4.find("div").remove()
      $h4.find("p").remove()
      let h4txt = $h4.text().trim()
      let txt = sanitizeInputWord(h4txt)
      let reg = "([\\w\\s'.,-0-9]{2,})\\s?\\[[\\w\\s.,-0-9]*?" // "word [der"
      let removeChars = new RegExp(/\./g, "")

      // derivations
      // for each phrase (between commas)
      let ders = txt.split(",")
      for (let txt of ders) {
        txt = txt.trim()

        // for each derivation (q = type)
        for (const q in THIS.derivations) {
          let r = reg + q
          let re = new RegExp(r, "gi")
          let match = txt.match(re)
          if (match && match.length) {
            for (let der of match) {
              der = der.substr(0, der.indexOf("[")).replace(removeChars, "").trim()
              if (minLen(der) && der.length < 22) {
                // add to list
                // THIS.derivations.abbreviation.push(word);
                if (q === "abbreviation" || q === "acronym") {
                  if (der.substr(0, 1).toLowerCase() !== THIS.key.substr(0, 1).toLowerCase()) {
                    continue
                  }
                }
                // get shortest word
                // (if comma separated) <- this is a bugfix
                THIS.derivations[q].push(der)
              }
            }
          }
        }
      }

      // synonyms
      let q = "synonym"
      let r = reg + q
      let re = new RegExp(r, "gi")
      let match = h4txt.match(re)
      if (match && match.length) {
        for (let der of match) {
          der = der.substr(0, der.indexOf("[")).replace(removeChars, "").trim()
          if (der.length > 1 && der.length < 22) {
            THIS.senses[THIS.sense || "etc"].synonyms.push(der)
          }
        }
      }

      // unmarked synonyms
      let matches = h4txt.match(/\| ([\w\s-' ]{2,})/g)
      if (matches) {
        for (const word of matches) {
          THIS.senses[THIS.sense || "etc"].synonyms.push(word.replace(/\|/g, "").trim())
        }
      }
    })

    // ETYMOLOGY
    $("#etymology i").each(function (i, el) {
      if (!THIS.senses.etc.etymology) {
        THIS.senses.etc.etymology = []
      }

      const $el = $(el)
      const $section = $el.parents(".r")
      let word = $el.text().trim()
      // fix capitalization
      try {
        let $bold = $section.find("h4 b")
        if ($bold.length) {
          let bold = $bold.text().trim()
          let boldCase = ""
          if (bold) {
            bold = bold.substr(0, 2)
            if (bold === bold.toUpperCase()) {
              boldCase = "toUpperCase"
            } else if (bold === bold.toCapitalized()) {
              boldCase = "toCapitalized"
            } else {
              boldCase = "toLowerCase"
            }
            // change case to match 'h4 b'
            word = word[boldCase]()
          }
        }
      } catch (e) {}
      // add to etymology
      THIS.senses.etc.etymology.push(word)
    })

    // ETYMONLINE "synonym"
    var etymonlineText = $("#es p").text()
    var etMatch = etymonlineText.match(/"([\w]+)"/)
    if (etMatch && etMatch[1]) {
      THIS.senses[THIS.sense || "etc"].synonyms.push(etMatch[1])
    }

    /**
     *
     * AGGREGATE...
     *
     */
    // derivation map
    const posMap = {
      "determiner": "determiners",
      "adverb": "adverbs",
      "adjective": "adjectives",
      "noun": "nouns",
      "verb": "verbs",
      "pronoun": "pronouns",
      "preposition": "prepositions",
      "conjunction": "conjunctions",
      "interjection": "interjections",
      "abbreviation": "",
      "etc": "etc",
      "plural": "nouns",
      "derived": "etc",
      "sense": "",
      "comparative": "adjectives",
      "superlative": "adjectives",
      "present participle": "",
      "past participle": "verbs",
      "past tense": "verbs",
      "3rd-person": "verbs",
      "bold": ""
    }
    // THIS.derivations >> sense
    for (const dpos in posMap) {
      const pos = posMap[dpos]
      for (const word of THIS.derivations[dpos]) {
        // special case for abbreviations (could be in 2 categories)
        if (dpos === "abbreviation" || /[A-Z]{2}/.test(word.substr(0, 2))) {
          // abbreviated (in list or ABBR)
          if (word.substr(0, 1).toLowerCase() === THIS.key.substr(0, 1).toLowerCase()) {
            THIS.senses[THIS.sense || "nouns"].abbreviations.push(word)
          }
        }
        // derivation > THIS.senses
        if (dpos === "plural") {
          // plural
          if (word.substr(0, 1).toLowerCase() === THIS.key.substr(0, 1).toLowerCase()) {
            THIS.senses.nouns.plurals.push(word)
          }
        } else if (dpos === "3rd-person") {
          // 3rd-person
          THIS.senses.verbs["3rd-person"].push(word)
        } else if (dpos === "present participle") {
          // gerund
          const spos = THIS.sense || "verbs"
          THIS.senses[spos]["gerunds"].push(word)
        } else if (dpos === "bold") {
          // unsorted derivations
          const spos = THIS.sense || "etc"
          if (word.substr(0, 1).toLowerCase() === THIS.key.substr(0, 1).toLowerCase()) {
            THIS.senses[spos].roots.push(word)
          }
        } else if (dpos === "sense" || !pos) {
          // unsorted synonyms
          const spos = pos || THIS.sense || "etc"
          THIS.senses[spos].synonyms.push(word)
        } else {
          // add to pos
          THIS.senses[pos].derivations.push(word)
        }
      }
    }
    // THIS.senses[type] >> MOVE/REMOVE
    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]
      for (const type in sense) {
        // always ignore keys
        if (type === "keys") {
          continue
        }
        /*
         * sense.derivations >> sense.synonyms
         */
        if (type === "derivations") {
          /*
           * sense.derivations >> sense.synonyms
           */
          // process type=derivations
          const list = [...sense[type]]
          for (const word of list) {
            // word is current str being iterated, key is query
            const key = sense.keys[0] || THIS.key
            // first syllable of both words has to match
            let kSyllableLength = firstSyllable(key).length
            let wSyllableLength = firstSyllable(word).length
            let until = kSyllableLength < wSyllableLength ? kSyllableLength : wSyllableLength
            // check word
            if (word.substr(0, until).toLowerCase() !== key.substr(0, until).toLowerCase()) {
              // add to...
              if (/[A-Z]{2}/.test(word.substr(0, 2))) {
                // abbreviations
                THIS.senses[pos].abbreviations.push(word)
              } else {
                // derivations
                THIS.senses[pos].synonyms.unshift(word)
                // remove from derivations
                THIS.senses[pos][type].splice(THIS.senses[pos][type].indexOf(word), 1)
              }
            }
          }
        }
      }
    }

    /**
     *
     * FIX SENSES...
     *
     */
    // fix NOUNS
    if (
      THIS.senses.nouns.derivations.length ||
      THIS.senses.nouns.synonyms.length ||
      THIS.senses.nouns.abbreviations.length
    ) {
      // list all relevant words
      const list = [...THIS.senses.nouns.derivations, ...THIS.senses.nouns.synonyms, ...THIS.senses.nouns.abbreviations]
      const corpus = JSON.stringify(list).toLowerCase()
      for (let word of list) {
        const lowercaseWord = word.toLowerCase()
        // if pluralized version exists in corpus
        if (corpus.indexOf('"' + lowercaseWord + 's"') !== -1) {
          // add it to plurals
          if (!THIS.senses.nouns.plurals.includes('"' + lowercaseWord + 's"')) {
            if (!THIS.derivations.plural.length) {
              THIS.senses.nouns.plurals.push(word + "s")
            }
          }
        }
      }
    }
    // IF SINGLE SENSE,...
    if (THIS.sense && THIS.sense !== "etc") {
      // DELETE ALL OTHER SENSES
      for (const pos in THIS.senses) {
        if (pos !== THIS.sense && pos !== "etc") {
          delete THIS.senses[pos]
        }
      }
      // sense key
      if (!THIS.senses[THIS.sense].keys.length) {
        THIS.senses[THIS.sense].keys.push(THIS.key)
      }
      // sense root
      for (const word of THIS.derivations.bold) {
        if (word.substr(0, 1).toLowerCase() === THIS.key.substr(0, 1).toLowerCase()) {
          THIS.senses[THIS.sense].derivations.push(word)
          THIS.senses[THIS.sense].roots.push(word)
        }
        if (word.substr(0, 1) === THIS.key.substr(0, 1).toUpperCase()) {
          THIS.senses[THIS.sense].propers.push(word)
        }
      }
    }

    // parse Capitalized words - add to .propers
    for (const pos in THIS.senses) {
      let sense = [...THIS.senses[pos].derivations, ...THIS.senses[pos].synonyms, ...THIS.senses[pos].types]
      const text = JSON.stringify(sense)
      const propers = text.match(
        /"([A-Z]{1}[a-z-]{2,} ?[A-Z]{0,1}[a-z- ]{0,} ?[A-Z]{0,1}[a-z- ]{0,} ?[A-Z]{0,1}[a-z- ]{0,} ?[A-Z]{0,1}[a-z- ]{0,})/g
      )
      if (propers && propers.length > 2) {
        sense.propers = propers.map(function (word) {
          word = word.substr(1) // remove leading '"', from matched regex of JSON string
          return word.trim()
        })
      }
    }

    /**
     *
     * FIX SENSES
     *
     */
    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]

      // from sense.derivations (find shortest word)
      // IGNORE ETC DERIVATIONS, because they are not reliable
      if (pos !== "etc") {
        if (sense.derivations) {
          let shortestRoot = ""
          for (const word of sense.derivations) {
            if (word.length <= 2) {
              continue
            }
            if (!shortestRoot || word.length < shortestRoot.length) {
              // has to match first letters of key (filter out garbage)
              const key = sense.keys[0] || THIS.key
              // first syllable of both words has to match
              let kSyllableLength = firstSyllable(key).length
              let wSyllableLength = firstSyllable(word).length
              let until = kSyllableLength < wSyllableLength ? kSyllableLength : wSyllableLength
              // check word
              if (word.substr(0, until).toLowerCase() === key.substr(0, until).toLowerCase()) {
                // no spaces in root (will handle contractions later)
                if (word.indexOf(" ") === -1) {
                  // last letter can't be a vowel, but "e" is ok
                  if (
                    word.substr(-1).toLowerCase() !== "a" &&
                    word.substr(-1).toLowerCase() !== "i" &&
                    word.substr(-1).toLowerCase() !== "o" &&
                    word.substr(-1).toLowerCase() !== "u" &&
                    word.substr(-1).toLowerCase() !== "y"
                  ) {
                    // can't be plural or abbreviation,
                    // can't be a derivation like "past tense" or something
                    if (
                      !sense.plurals.includes(word) &&
                      !sense.abbreviations.includes(word) &&
                      !THIS.derivations["past tense"].includes(word) &&
                      !THIS.derivations["superlative"].includes(word) &&
                      !THIS.derivations["comparative"].includes(word) &&
                      !THIS.derivations["plural"].includes(word) &&
                      !THIS.derivations["past participle"].includes(word) &&
                      !THIS.derivations["future tense"].includes(word) &&
                      !THIS.derivations["3rd-person"].includes(word) &&
                      !THIS.derivations["abbreviation"].includes(word)
                    ) {
                      shortestRoot = word
                    }
                    // get another chance! if wrongly filtered out above, but good root
                    if (THIS.derivations["bold"].includes(word)) {
                      shortestRoot = word
                    }
                  }
                }
              }
            }
          }
          if (shortestRoot && shortestRoot.length <= THIS.key.length + 1) {
            sense.roots.unshift(shortestRoot)
          }
        }
      }
    }

    /**
     *
     * FILTER (remove bad) WORDS
     *JSON.stringify(sense).replace(/"[\w]+":/g, '')
     */
    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]
      // build list of words to filter against
      let senseJSONList = [
        ...sense.derivations,
        ...sense.keys,
        ...sense.plurals,
        ...sense.definitions,
        ...sense.propers
      ]
      let senseJSONText = JSON.stringify(senseJSONList)
      // iterate each type (derivations, synonyms, definitions, plurals, etc)
      for (const type in sense) {
        /*
         * FIRST, edit each word
         */
        sense[type] = sense[type].map(mapWords)
        /*
         * THEN, FILTER by type
         */
        // if ABBR, or Proper, must appear at least twice: itself +1
        if (type === "abbreviations" || type === "propers" || type === "plurals") {
          const list = [...sense[type]]
          // delete all words in list
          sense[type] = []
          // then put back if word is ok
          // (this is a patch, had a hard time simply removing the index from array)
          for (const word of list) {
            const match = senseJSONText.match(new RegExp(`"${word}"`, "gi"))
            if (!match || match.length < 2) {
              // delete word
              // does not appear twice in results, does not start with same letter
              THIS.toDelete.push(word)
            } else {
              // keep it
              // word appears twice in results, so good Proper or ABBR
              sense[type].push(word)
            }
          }
        }
        // must match first letter of key
        if (type === "abbreviations" || type === "plurals" || type === "propers" || type === "derivations") {
          const list = sense[type]
          let i = 0
          while (i < list.length) {
            const word = list[i]
            if (word.substr(0, 1).toLowerCase() !== THIS.key.substr(0, 1).toLowerCase()) {
              // remove from derivations
              list.splice(i, 1)
              // add to synonyms
              sense.synonyms.push(word)
            } else {
              i++
            }
          }
        }
      }
    }

    // FILTER EACH POS:
    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]
      if (!sense) continue

      // each pos
      for (const type in sense) {
        // keys and roots should not need filtering!
        if (type === "keys" || type === "propers") {
          // special cases, really should only be one in the list
        } else {
          // REMOVE KEY FROM RESULTS
          if (THIS.key && type !== "plurals") {
            sense[type] = sense[type].filter(filterWord_removeThis.bind({ type: type, key: THIS.key.toLowerCase() }))
          }
          // remove 2-letter strings
          let pronounAbbreviation = false
          if (
            THIS.sense === "pronouns" ||
            THIS.sense === "abbreviations" ||
            (sense.abbreviations || []).length ||
            (sense.pronouns || []).length
          ) {
            pronounAbbreviation = true
          }
          sense[type] = sense[type].filter(
            filterWord_minLengthThis.bind({ type: type, minLength: pronounAbbreviation ? 2 : 3 })
          )
        }
      }
    }

    /*
     * Search keys, compile keys
     */
    THIS.keys = []
    if (THIS.key) {
      THIS.keys.push(THIS.key)
    }
    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]

      // each key
      for (const word of sense.keys) {
        THIS.keys.push(THIS.key)

        // found abbreviation
        if (word === word.toUpperCase()) {
          sense.abbreviations.unshift(word)
        }
      }
    }
    THIS.keys = [...new Set(THIS.keys)]

    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]

      // each type
      for (const type in sense) {
        const list = sense[type]

        for (const index in list) {
          const word = list[index]

          // found plural
          // if word ends in "s", and there is a key of word without the s
          // NOTE: Not checking case insensitive keys without the s
          if (word.substr(-1).toLowerCase() === "s" && THIS.keys.includes(word.substr(0, word.length - 1))) {
            if (!THIS.derivations.plural.length) {
              THIS.senses[pos][type].splice(index, 1)
              THIS.senses[pos].plurals.unshift(word)
            }
          }
        }
      }

      // limit types to first 2 results
      THIS.senses[pos].types = THIS.senses[pos].types.slice(0, 2)
    }

    /**
     *
     * REMOVE DUPLICATES, TOP -> DOWN
     *
     */
    for (const pos in THIS.senses) {
      const sense = THIS.senses[pos]

      // choose one type at a time
      for (const chosen_type in sense) {
        const chosen_words_list = sense[chosen_type]

        // each word in chosen_type
        for (const chosen_word of chosen_words_list) {
          // remove that word from any other type.list
          for (const type in sense) {
            const list = sense[type]
            // .keys and .plurals may contain duplicates, and ofcourse ignore self
            if (
              type === "keys" ||
              type === "plurals" ||
              type === "propers" ||
              type === "roots" ||
              type === chosen_type
            ) {
              continue
            }
            // otherwise, remove the word if it appears
            // but first, we have to find the word index
            for (const index in list) {
              const word = list[index]
              if (word === chosen_word) {
                // console.warn(`remove word "${word}/${chosen_word}" at index ${index} from sense[${type}]`);
                sense[type].splice(index, 1)
              }
            }
          }
        }
      }
    }

    /**
     *
     * KEY = ABBREVIATION
     *
     */
    if (THIS.key === THIS.key.toUpperCase()) {
      THIS.senses.etc.abbreviations.unshift(THIS.key)
    }
    THIS.senses.etc.bold = THIS.derivations.bold

    /**************************************************************************************
     *
     * ABANDON THIS.senses (below this line) **********************************************
     *
     * CREATE posWords INSTEAD ************************************************************
     *
     *************************************************************************************/
    var posWords = {}
    var posKeys = Object.keys(THIS.senses)
    posKeys.sort(function (sense_corpus_a, sense_corpus_b) {
      // sort by total length of characters, of all results: der/syn/def/typ
      var rating_a = JSON.stringify(THIS.senses[sense_corpus_a]).length
      var rating_b = JSON.stringify(THIS.senses[sense_corpus_b]).length
      if (rating_a > rating_b) {
        return -1
      } else if (rating_a < rating_b) {
        return 1
      } else {
        return 0
      }
    })
    // Reconstruct posWords from sorted THIS.senses
    for (const pos of posKeys) {
      posWords[pos] = THIS.senses[pos]
    }

    /**
     *
     * CLEANUP posWords (filter, rearrange, delete)
     *
     */
    // REMOVE empty pos/types
    for (const pos in posWords) {
      const sense = posWords[pos]
      for (const type in sense) {
        // empty sense type (derivations, plurals,)
        if (!sense[type].length) {
          delete posWords[pos][type]
        }
      }
    }
    // empty sense (nouns, adverbs,)
    for (const pos in posWords) {
      if (!Object.keys(posWords[pos]).length) {
        delete posWords[pos]
      }
    }
    // MOVE "etc" to bottom
    let posWordsEtc = posWords.etc
    delete posWords.etc
    // KEEP only first 3 "pos"
    let i = 0
    for (const pos in posWords) {
      if (i >= 3) {
        delete posWords[pos]
      }
      i++
    }
    // PUT BACK "etc"
    if (posWordsEtc) {
      posWords.etc = posWordsEtc
    }

    /**
     *
     * FIX THIS
     *
     */
    // THIS.root, THIS.plural, THIS.key
    for (const pos in posWords) {
      const sense = posWords[pos]
      // find shortest plural
      if (sense.plurals && sense.plurals.length) {
        const word = sense.plurals[0]
        if (!THIS.plural || word.length < THIS.plural.length) {
          if (word.substr(0, 1).toLowerCase() === THIS.key.substr(0, 1).toLowerCase()) {
            if (word !== THIS.plural) {
              THIS.plural = word
            }
          }
        }
      }
      // find shortest root
      if (!THIS.root) {
        if (sense.roots && sense.roots.length) {
          const word = sense.roots[0]
          if (word.length < THIS.root.length) {
            if (word !== THIS.plural) {
              THIS.root = word
            }
          }
        }
      }
    }
    // alt
    if (THIS.plural === THIS.key) {
      THIS.plural = ""
    }
    if (THIS.root === THIS.key || THIS.root.length > THIS.key.length) {
      THIS.root = ""
    }

    /**
     *
     * FORMAT OUTPUT...
     *
     */
    for (const pos in posWords) {
      let sense = posWords[pos]
      for (let type in sense) {
        let list = sense[type]
        posWords[pos][type] = sortByFrequencyLength(list)
        if (
          type === "keys" ||
          type === "roots" ||
          type === "gerunds" ||
          type === "plurals" ||
          type === "abbreviations"
        ) {
          posWords[pos][type] = posWords[pos][type].slice(0, 1)
        }
      }
    }

    /**
     * Move Etymology to its own key
     */
    if (posWords.etc && posWords.etc.etymology) {
      const etymology = posWords.etc.etymology
      delete posWords.etc.etymology
      posWords.etymology = { derivations: etymology }
    }

    /**
     * Add best $('#r h4 b') text to root
     */
    if (posWords.etc && posWords.etc.bold && posWords.etc.bold[0]) {
      let root = posWords.etc.bold[0]
      if (!posWords.etc.roots) {
        posWords.etc.roots = []
      }
      if (!posWords.etc.roots.includes(root)) {
        posWords.etc.roots.unshift(root)
      }
      delete posWords.etc.bold
    }
    // clog(posWords.etc);

    /**
     * FIND PROPER
     */
    const Proper = phrase_capitalize(THIS.key)
    // each pos
    for (const pos in posWords) {
      const sense = posWords[pos]
      if (!sense) continue

      // SETUP
      // IMPORTANT: Ignore all other propers detected - they are not accurate. Only do below:
      // if (!posWords[pos].propers || posWords[pos].propers.length < 4) {
      posWords[pos].propers = []
      // }

      // PROPER - CHECK TITLE
      if (THIS.key === Proper) {
        posWords[pos].propers.push(THIS.key)
      }

      // PROPER - CHECK KEYS - MATCH 1+
      // check only roots and derivations
      // search for proper
      if (pos !== "etc") {
        const text = JSON.stringify(sense.keys || "")
        if (!text) {
          continue
        }
        // match pattern
        const properExact = text.match(new RegExp(`"${Proper}"`, "g"))
        const properStart = text.match(new RegExp(`"${Proper}[\w -']*?"`, "g"))
        const properEnd = text.match(new RegExp(`"[\w -']*?${Proper}"`, "g"))
        // matches
        if (
          (properExact && properExact.length >= 1) ||
          (properStart && properStart.length > 1) ||
          (properEnd && properEnd.length > 1)
        ) {
          posWords[pos].propers.push(Proper) // start after first character, to account for leading `"`
        }
      }

      // PROPER - CHECK ROOTS AND DERIVATIONS - MATCH 2+
      // check only roots and derivations
      // search for proper
      if (pos !== "etc") {
        const text = JSON.stringify(sense.roots || "") + JSON.stringify(sense.derivations || "")
        if (!text) {
          continue
        }
        // match pattern
        const properExact = text.match(new RegExp(`"${Proper}"`, "g"))
        const properStart = text.match(new RegExp(`"${Proper}[\w -']*?"`, "g"))
        const properEnd = text.match(new RegExp(`"[\w -']*?${Proper}"`, "g"))
        // matches
        if (
          (properExact && properExact.length >= 2) ||
          (properStart && properStart.length > 2) ||
          (properEnd && properEnd.length > 2)
        ) {
          posWords[pos].propers.push(Proper) // start after first character, to account for leading `"`
        }
      }

      // PROPER - CHECK EVERYTHING - MATCH 3+
      // check only roots and derivations
      // search for proper
      if (pos !== "etc") {
        const text = JSON.stringify(sense || "")
        if (!text) {
          continue
        }
        // match pattern
        const properExact = text.match(new RegExp(`"${Proper}"`, "g"))
        const properStart = text.match(new RegExp(`"${Proper}[\w -']*?"`, "g"))
        const properEnd = text.match(new RegExp(`"[\w -']*?${Proper}"`, "g"))
        // matches
        if (
          (properExact && properExact.length >= 3) ||
          (properStart && properStart.length > 3) ||
          (properEnd && properEnd.length > 3)
        ) {
          posWords[pos].propers.push(Proper) // start after first character, to account for leading `"`
        }
      }

      // CLEANUP
      if (posWords[pos].propers && !posWords[pos].propers.length) {
        delete posWords[pos].propers
      }
    }

    /**
     *
     * FORCE DERIVATIONS TO OUTPUT...
     *
     */
    if (!posWords.etc) {
      posWords.etc = {}
    }
    if (!posWords.etc.derivations) {
      posWords.etc.derivations = []
    }
    for (let dername in THIS.derivations) {
      if (dername === "plural") continue
      posWords.etc.derivations = [...posWords.etc.derivations, ...THIS.derivations[dername]]
    }
    posWords.etc.derivations = [...new Set(posWords.etc.derivations)]
    posWords.etc.derivations.sort((a, b) => a.length - b.length)
    /*
     * Remove abbreviations from derivations
     */
    for (let pos in posWords) {
      let sense = posWords[pos]
      for (let type in sense) {
        if (type !== "abbreviations") continue
        for (let word of sense[type]) {
          console.log("requests.js", word)
          let index = posWords.etc.derivations.indexOf(word)
          console.log("index.mjs", index)
          if (index !== -1) {
            posWords.etc.derivations.splice(index, 1)
          }
        }
      }
    }

    /**
     *
     * OUTPUT...
     *
     */
    return posWords
  })()

  return output
}
