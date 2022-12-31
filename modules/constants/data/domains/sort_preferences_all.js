import all from "./all"
import sort_preferences from "./sort_preferences"

/*
 * If no score, give it zero
 */
let ratings = {}
for (let tld in all) {
  ratings[tld] = sort_preferences[tld] || 0
}

export default ratings
