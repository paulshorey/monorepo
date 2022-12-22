module.exports = function (pos) {
    let group = "etc"; // unknown or unsorted or symbol
    switch (pos) {
        case "JJ": // adjective (big)
        case "JJR": // comparative (bigger)
        case "JJS": // superlative (biggest)
        case "PDT": // possessive ending
            group = "adjectives";
            break;
        case "RB": // adverb (quickly)
        case "RBR": // comparative (faster)
        case "RBS": // superlative (fastest)
        case "WRB": // wh-adverb (how, where) "how to do something"
            group = "adverbs";
            break;
        case "VB": // base (eat)
        case "VBD": // past tense (ate)
        case "VBG": // gerund (eating)
        case "VBN": // past part (eaten)
        case "VBP": // present (eat)
        case "VBZ": // present part (eats)
            group = "verbs";
            break;
        case "NN": // singular
        case "NNP": // Proper singular
        case "NNPS": // Proper plural
        case "NNS": // plural
            group = "nouns";
            break;
        case "PP$": // possessive pronouns (my, yours)
        case "PRP": // personal pronouns (i, you, she)
        case "WP": // (who, what)
        case "WP$": // possessive (whose)
            group = "pronouns";
            break;
        case "UH": // interjection (oops, wow)
            group = "interjections";
            break;
        case "CC": // conjunction (and, or)
            group = "conjunctions";
            break;
        case "IN": // preposition (of, in, by)
            group = "prepositions";
            break;
        case "CD": // cardinal number (one, two)
        case "DT": // determiner (the, some)
        case "EX": // existential "there"
        case "LS": // line number (one, 1., a.)
        case "WDT": // (which, that)
            group = "determiners";
            break;
        case "MD": // modal adverb (can, should)
        case "TO": // "to" - adverb, but ignore it
        case "SYM": // symbol character
        case "RP": // particle (up, off)
            group = "etc";
            break;
    }
    return group;
};
