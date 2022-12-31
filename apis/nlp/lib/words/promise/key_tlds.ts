/*
 * Dependencies
 */
import all_domains from "@techytools/constants/data/domains/all"
import { data_domain_syns1, data_domain_syns2, data_domain_syns3 } from "@ps/nlp/lib/pgdb/data.domains"

/**
 * Get list of domains for a given query keyword
 * @params {string} key - word to find matching domains forf
 * @resolves {array} - array of arrays of strings
 */
const DEBUG1 = false
export default async function (key) {
  if (!key) return []
  let syns1, syns2
  /*
   * add synonyms
   */
  syns1 = (await data_domain_syns1(key)) || []
  syns1 = syns1.map((d) => d.key)
  if (DEBUG1) global.cconsole.log(`syns 1 ILIKE "${key}" = `, syns1)

  syns2 = (await data_domain_syns2(key)) || []
  syns2 = syns2.map((d) => d.key)
  if (DEBUG1) global.cconsole.log(`syns 2 ILIKE "${key}" = `, syns2)

  // let syns3 = (await data_domain_syns3(key)) || []
  // syns3 = syns3.map((d) => d.key)
  // if (DEBUG1) global.cconsole.log(`syns 3 ILIKE "${key}" = `, syns3)

  /*
   * add self
   */
  if (all_domains[key]) {
    syns1.unshift(key)
  }

  /*
   * Return
   */
  // resolve([...domains_set]);
  return [...syns1, ...syns2]
}
