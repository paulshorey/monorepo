import dict_info from "./dict_info"

/**
 *
 * @param row {object}
 * @param row.key {string} - sanitized str (either key or str required)
 * @param row.str {string} - un-sanitized key, with punctuation (either key or str required)
 * @param row.pos1 {string} - 3-letter part of speech (optional, but highly recommended)
 * @returns {object}
 */
const row_model = function (row: any) {
  if (row.key && !row.str) {
    row.str = row.key
  } else if (!row.key && row.str) {
    row.key = row.str
      .replace(/[^\w\d\s]+/g, "")
      .toLowerCase()
      .trim()
  } else if (!row.key && !row.str) {
    throw new Error("!row.key && !row.str in row_model")
  }
  if (!row.pos1) {
    row.pos1 = "etc"
  }
  let model: any = {
    sentiment: 0,
    dict: {},
    pos_short: { [row.pos1]: [], all: [] },
    poss: { [row.pos1]: [] },
    tlds: [[], [], [], [], []],
    list: [],
    ok_list: [],
    list_count: 0,
    ok_count: 0,
    word_count: row.key.split(" ").length,
    char_count: row.key.length,
    ...row
  }
  /*
   * add synonym
   */
  model.add_syn = function (word, pos = this.pos1) {
    // only add if not exist - because one that exists probably has more accurate metadata
    if (!this.dict[word]) {
      // get model in order to build dict_info
      let wrow = row_model({ key: word, pos1: pos })
      this.dict[word] = dict_info(wrow, "", true)
      // add meta data
      this.list_count++
      this.ok_count++
      if (!this.pos_short[pos]) {
        this.pos_short[pos] = []
      }
      this.pos_short[pos].unshift(word)
      this.ok_list.unshift(word)
      this.list.unshift(word)
    }
  }.bind(model)
  /*
   * edit pos
   */
  model.fix_pos = function (pos) {
    let pos_set = new Set()
    if (pos) pos_set.add(pos)
    if (this.pos1) pos_set.add(this.pos1)
    if (this.pos2) pos_set.add(this.pos2)
    if (this.pos3) pos_set.add(this.pos3)
    if (this.pos4) pos_set.add(this.pos4)
    if (this.pos5) pos_set.add(this.pos5)
    let pos_arr = [...pos_set]
    if (pos_arr[0]) this.pos1 = pos_arr[0]
    if (pos_arr[1]) this.pos2 = pos_arr[1]
    if (pos_arr[2]) this.pos3 = pos_arr[2]
    if (pos_arr[3]) this.pos4 = pos_arr[3]
    if (pos_arr[4]) this.pos5 = pos_arr[4]
  }.bind(model)
  return model
}

export default row_model
