import all_scores from './all_scores'
import sort_preferences from './sort_preferences'

/*
 * Get first (highest) score
 */
let highest_score = 1
for (let tld in all_scores) {
  highest_score = all_scores[tld]
  break // breaks after reading first in list
}

/*
 * Modify all scores: add multipler
 */
for (let tld in sort_preferences) {
  let score = all_scores[tld]
  let multiplier = sort_preferences[tld]
  all_scores[tld] = score + (multiplier * highest_score)
  score--
}

export default all_scores



