// good == gt zero; bad == lt zero;
/*
 * BEST and WORST values have to be the same absolute value, but one positive, other negative
 * sometimes, an extension comes up at the top too often, because it has many synonyms
 * or, an extension is not open to the public, and must be applied for with special rules
 */
export default {
  com: 10, // this one goes so well with so many words!
  cafe: 6,
  design: 5,
  store: 5,
  ai: 4,
  org: 5,
  app: 5,
  fun: 4, // yay fun!
  space: 2,
  studio: 1,
  games: 1,
  movie: 1,
  film: 1,
  gay: 1,
  tech: -1, // comes up slightly too often
  singles: -1,
  work: -1, // don't like to work :)
  parts: -2, // because it's kind of negative, like "junkyard", "for repair", "not working"
  graphics: -2, // occurs too frequently, too long
  lgbt: -2,
  red: -2,
  navy: -2,
  solutions: -2,
  green: -2,
  insure: -3, // awkward - should be "insurance"
  porn: -3, // naughty!
  computer: -3, // too long
  swiss: -3, // has to do with mountains, but should be last priority
  markets: -3, // there is a better ".market" which has same synonyms
  ngo: -4, // comes up often in synonyms... but does anybody actually want this TLD?
  law: -2, // is such short one, and has many synonyms, so gets sorted high up
  qpon: -2,
  onl: -3, // usually un-registered, so comes up in results too much
  domains: -3, // very narrow use case
  bio: -3, // not a great tld, but comes up often for synonyms
  edu: -6, // strictly regulated
  tel: -2,
  how: -2,
  rehab: -3,
  llc: -3,
  ltd: -3,
  diet: -2, // comes up too much as a synonym, not the most useful tld
  wtf: -1, // crude, comes up too often !!!
  bar: -2, // booze likes to come up for any liquid
  beer: -3, // booze likes to come up for any liquid
  airforce: -5,
  army: -5, // too violent
  vodka: -6, // booze likes to come up for any liquid
  new: -10, // needs pre-approval
  bot: -8, // needs pre-approval
  museum: -10, // needs pre-approval
  aero: -10, // needs pre-approval
  gop: -10,
  democrat: -10,
  republican: -10,
  post: -10 // only for postal service
}
