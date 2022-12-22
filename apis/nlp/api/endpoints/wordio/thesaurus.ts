import str_row from "@ps/nlp/api/endpoints/data.words/promise/str_row"
import { data_word_get_parsed } from "@ps/nlp/api/endpoints/data.words/pgdb"
import aggregate_req_body_query from "@ps/fn/io/req/aggregate_req_body_query_params"

let DEBUG1 = false

export default [
  {
    path: "/v1/word/:str?",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      let query = aggregate_req_body_query(req)
      const row = await str_row(query.str)
      if (!row) throw `!row key="${query.str}"`
      fix_row(row)
      return row
    }
  },
  {
    path: "/v1/synonyms/:str?",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      let query = aggregate_req_body_query(req)
      const row = await data_word_get_parsed(query.str, "key, str, pos1, pos2, pos3, dict")
      if (!row) throw new Error(`!row key="${query.str}"`)
      fix_row(row)
      return row
    }
  },
  {
    path: "/v1/word-info/:str?",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      let query = aggregate_req_body_query(req)
      const row = await data_word_get_parsed(
        query.str,
        "key, str, root, proper, singular, plural, abbreviation, acronym, ctr, pos1, pos2, pos3, pos4, pos5, sentiment, name, brand, food, stop, aux, prefix, list_count, word_count, char_count, syl_count"
      )
      if (!row) throw new Error(`!row key="${query.str}"`)
      fix_row(row)
      return row
    }
  }
]

/*
 * HELPERS
 */
function fix_row(row) {
  if ("sentiment" in row) {
    row.sentiment = Math.min(row.sentiment + 1, 1) // -1,0,1 -> 0,1
  }

  if (row.dict) {
    row.synonyms = []
    let pos_nums: any = {}
    let pos_maxs: any = {}
    if (row.pos1) pos_maxs[row.pos1] = row["x" + row.pos1] || 30
    if (row.pos2) pos_maxs[row.pos2] = row["x" + row.pos2] || 30
    if (row.pos3) pos_maxs[row.pos3] = row["x" + row.pos3] || 30
    if (row.pos4) pos_maxs[row.pos4] = row["x" + row.pos4] || 30
    if (row.pos5) pos_maxs[row.pos5] = row["x" + row.pos5] || 30
    for (let key in row.dict) {
      // each synonym
      let info = row.dict[key]
      if (!info[12]) continue // must be synonym, not derivation
      let str = typeof info[3] === "string" && info[3] ? info[3] : key
      let pos = info[9]
      // add ?
      if (!pos_maxs[pos]) continue
      if (pos_nums[pos] && pos_nums[pos] >= pos_maxs[pos]) continue
      // add
      row.synonyms.push([str, info[0], info[1], info[2], pos])
      if (!pos_nums[pos]) pos_nums[pos] = 0
      pos_nums[pos]++
    }
  }

  if (!DEBUG1) {
    delete row.dict
    delete row.poss
    delete row.xnou
    delete row.xadj
    delete row.xver
    delete row.xadv
    delete row.xint
    delete row.xdet
    delete row.xpro
    delete row.xpre
    delete row.xcon
    delete row.xetc
    if (!row.prefix) {
      delete row.prefix
    }
    if (!row.ctr) {
      delete row.ctr
    }
  }

  return row
}
