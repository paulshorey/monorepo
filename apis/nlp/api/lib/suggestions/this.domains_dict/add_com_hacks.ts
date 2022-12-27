// let DEBUG1 = false
//
// const add_dom = function (words, rating = 0) {
//   let dom: any = {
//     words: words,
//     list: "com",
//     rating: rating,
//     tld: "com",
//     string: words.join(" ") + " .com"
//   }
//   this.domains_dict[dom.string] = dom
// }
//
// export default function () {
//   /*
//    * first, add any extras, which were not relevant enough for nTLDs
//    */
//   for (let words of this.com_hacks) {
//     add_dom.call(this, words)
//   }
//
//   /*
//    * add all synonyms
//    */
//   let key_ver = ""
//   let row_ver: any = {}
//   let row_nou: any = {}
//   // for (let key in this.chunks_dict) {
//   //   let row = this.chunks_dict[key]
//   //   // skip bad words
//   //   if (key.length <= 2 || (key.length <= 4 && row.list_count <= 25)) {
//   //     continue
//   //   }
//   //   // note for "verb the noun"
//   //   if (row.pos1 === "ver") row_ver = row
//   //   else if (row.pos2 === "ver" && row.root) key_ver = row.root
//   //   else if (row.pos1 === "nou") row_nou = row
//   //   // each positive word
//   //   let i = 0
//   //   for (let word of row.ok_list) {
//   //     if (i < 30 || word.length < 10) {
//   //       add_dom.call(this, [word], 100)
//   //     }
//   //     i++
//   //   }
//   // }
//
//   /*
//    * "verb the noun"
//    */
//   if (row_ver.key) {
//     key_ver = row_ver.key
//   }
//   if (DEBUG1) console.log("verb the noun - ", key_ver, row_nou.key)
//   if (key_ver && row_nou.key) {
//     /*
//      * (self)the(noun)
//      */
//     if (!row_ver || !row_ver.pos1changed) {
//       if (row_nou.plural) {
//         let plural = [key_ver, row_nou.plural]
//         add_dom.call(this, plural, 0)
//         let singular = [key_ver, "the", row_nou.key]
//         add_dom.call(this, singular, 0)
//       } else if (row_nou.singular) {
//         let plural = [key_ver, row_nou.key]
//         add_dom.call(this, plural, 0)
//         let singular = [key_ver, "the", row_nou.singular]
//         add_dom.call(this, singular, 0)
//       } else {
//         let words = [key_ver, "the", row_nou.key]
//         add_dom.call(this, words, 0)
//       }
//     }
//     /*
//      * (synonym)the(noun)
//      */
//     // replace verb
//     if (row_ver.poss && row_ver.poss.ver) {
//       for (let i = 0; i < 5; i++) {
//         let word = row_ver.poss.ver[i]
//         if (word) {
//           let words = [word, "the", row_nou.key]
//           add_dom.call(this, words, 0)
//         }
//       }
//     }
//     // replace noun
//     if (row_ver.poss && row_ver.poss.nou && !row_ver.pos1changed) {
//       for (let i = 0; i < 5; i++) {
//         let word = row_nou.poss.nou[i]
//         if (word) {
//           let words = [row_ver.key, "the", word]
//           add_dom.call(this, words, 0)
//         }
//       }
//     }
//   }
// }
