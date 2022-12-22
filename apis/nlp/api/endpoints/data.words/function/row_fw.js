import row_model from "./row_model";
import fw_words from "@ps/nlp/data/words/fw/words";
import fw from "@ps/nlp/data/words/fw/fw";
import fw2pos from "@ps/nlp/data/words/fw/fw2pos";
/**
 * If word is included in fw list
 */
let DEBUG1 = false;
export default function (row) {
    /*
     *
     * Interrogative / group
     *
     */
    let fw_pos = "";
    let fw_cat = fw[row.key];
    if (fw_cat) {
        if (fw_cat.length === 3) {
            fw_pos = fw_cat;
        }
        else {
            fw_pos = fw2pos[fw_pos];
        }
        /*
         * fix pos
         */
        if (!row.fix_pos) {
            row = row_model(row);
        }
        row.fix_pos(fw_pos);
    }
    if (DEBUG1)
        global.cconsole.log(row.key, fw_cat, fw_pos);
    /*
     *
     * if FUNCTION WORD, do not use thesaurus synonyms -
     * - instead use words from list
     *
     */
    if (fw_pos) {
        // reset thesaurus content, but keep count
        let old_list_count = row.list_count;
        row = row_model({ key: row.key, pos1: fw_pos });
        row.list_count = old_list_count;
        // add content from list
        let syns = fw_words[fw_pos];
        if (syns) {
            for (let word of syns) {
                // to poss
                if (row.add_syn) {
                    row.add_syn(word);
                }
            }
        }
        /*
         * note
         */
        // row.fw = true
        row.aux = true;
        if (row.list_count < 25) {
            row.list_count = 25;
        }
    }
}
