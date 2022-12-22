// import add_from_derivations from "./add_from_derivations"
import stopwords from "@ps/nlp/data/words/stopwords";
/**
 * Analyze order of words in phrase. Make appropriate modifications to data.
 */
let DEBUG1 = false;
export default function () {
    let { chunks_keys, chunks_dict } = this;
    if (DEBUG1)
        global.cconsole.warn("NLP analyzing phrase", chunks_keys);
    for (let k in chunks_keys) {
        let i = Number(k);
        let key = chunks_keys[i];
        let row = chunks_dict[key];
        let prev_row = i - 1 >= 0 ? chunks_dict[chunks_keys[i - 1]] : null;
        let next_row = i + 1 < chunks_keys.length ? chunks_dict[chunks_keys[i + 1]] : null;
        // skip over determiner as if it is not there
        if (prev_row && prev_row.pos1 === "det") {
            prev_row = i - 2 < chunks_keys.length ? chunks_dict[chunks_keys[i - 2]] : null;
        }
        if (next_row && next_row.pos1 === "det") {
            next_row = i + 2 < chunks_keys.length ? chunks_dict[chunks_keys[i + 2]] : null;
        }
        // fix
        if (!row.pos1) {
            row.pos1 = "etc";
        }
        // if stopword, be very careful!
        if (stopwords[row.key]) {
            row.poss = { [row.pos1]: row.poss[row.pos1] ? row.poss[row.pos1].slice(0, 5) : [] };
            row.tlds = [row.tlds[0].slice(0, 5), [], []];
        }
        // verb->noun
        // if {noun-verb} precedes {noun}
        // make this {noun-verb} into {verb-noun}
        // NO NO NO - don't change meaning until can check that new meaning is positive
        // Example: "grub hub" -> grub noun is positive, verb is negative
        // if (row.pos1 === "nou" && row.pos2 === "ver" && next_row && next_row.pos1 === "nou") {
        //   row.pos1 = "ver"
        //   row.pos2 = "nou"
        // }
        // noun->noun
        if (row.pos1 === "nou" && prev_row && prev_row.pos1 === "nou" && !next_row) {
            // // noun->verb
            // if (row.pos2 === "ver" && prev_row.pos2 !== "ver") {
            //   row.pos1 = "ver"
            //   row.pos2 = ""
            //   row.pos3 = ""
            //   row.pos1changed = true
            // }
            // verb-noun
            if (prev_row.pos2 === "ver" && row.pos2 !== "ver") {
                prev_row.pos1 = "ver";
                prev_row.pos2 = prev_row.pos1;
                prev_row.pos3 = "";
                row.pos1changed = true;
            }
        }
        // adj->noun
        adjnou: {
            if (row.pos2 === "adj" && next_row && next_row.pos1 === "nou") {
                let pos2syns = row.poss[row.pos2] || [];
                if (pos2syns.length < 10)
                    break adjnou;
                row.pos1 = "adj";
                row.pos2 = row.pos1;
                row.pos3 = "";
                row.pos1changed = true;
            }
        }
        // adj->noun
        if ((row.pos1 === "nou" || row.pos2 === "nou") && row.pos1 !== "adj" && prev_row && prev_row.pos1 === "adj") {
            row.pos1 = "nou";
            row.pos2 = row.pos1;
            row.pos3 = "";
            row.pos1changed = true;
        }
        // if NOT noun, remove singular/plural
        if (row.pos1 === "ver") {
            // row.pos1 !== "nou" && row.pos1 !== "pro" && row.pos1 !== "pre"
            row.singular = "";
            row.plural = "";
        }
    }
}
