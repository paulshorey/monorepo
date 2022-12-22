// import { sort_objects_by_property_and_position } from "@ps/fn/io/sort_objects"
import rate_domain from "./function/rate_domain";
import sort_strings_by_length_and_position from "@ps/fn/io/sort_strings/sort_strings_by_length_and_position";
import sort_strings_by_rating_and_position from "@ps/fn/io/sort_strings/sort_strings_by_rating_and_position";
import strings_shuffle_last from "@ps/fn/io/strings/strings_shuffle_last2";
import strings_shuffle_first_last from "@ps/fn/io/strings/strings_shuffle_first_last2";
// import { sort_strings_by_length } from "@ps/fn/io/sort_words"
/**
 * Separate flat dict of { domname: listname } into dict of groups { listname: [ domname, ], }
 * @modifies this.domains {object} - dictionary of lists of domain strings {'list1':['domain1','domain2',],}
 */
let DEBUG1 = false;
let DEBUG2 = false;
// let DEBUG3 = false
export default function () {
    /*
     * rate nTLDs
     */
    let tlds_reversed = [...this.tlds_with_generic].reverse();
    let largest_rating = (tlds_reversed.length - 1) *
        (tlds_reversed.length - 1) *
        (tlds_reversed.length - 1) *
        (tlds_reversed.length - 1) *
        (tlds_reversed.length - 1);
    let tlds_ratings = {};
    tlds_reversed.forEach((tld, ti) => {
        tlds_ratings[tld] = Math.round(((ti * ti * ti * ti * ti) / largest_rating) * 100);
    });
    let tlds_bonus = {};
    tlds_bonus[this.tlds_with_generic[0]] = 50000;
    tlds_bonus[this.tlds_with_generic[1]] = 20000;
    tlds_bonus[this.tlds_with_generic[2]] = 4000;
    tlds_bonus[this.tlds_with_generic[3]] = 1000;
    tlds_bonus[this.tlds_with_generic[4]] = 500;
    tlds_bonus[this.tlds_with_generic[5]] = 100;
    tlds_bonus[this.tlds_with_generic[6]] = 25;
    tlds_bonus["co"] = 1000;
    let dom_ratings = {};
    this.dom_ratings = dom_ratings;
    /*
     * convert flat dictionary of { domain_name{String} : listname{String} }
     * into list of collections { listname{String}: array_of_aggregated_domains{Array<Object>}, }
     */
    for (let domstring in this.domains_dict) {
        let domain = this.domains_dict[domstring];
        // list
        let listname = domain.list;
        if (!this.domains_lists[listname]) {
            this.domains_lists[listname] = [];
        }
        // rate
        dom_ratings[domain.string] = (domain.rating || 0) + rate_domain.bind(this)(domain, tlds_ratings);
        // save
        if (domain.string) {
            if (domain.tld === "com") {
                if (domain.string.length <= 10) {
                    // ignore all ".com"s of <=10 characters including the tld
                }
                else {
                    // separate ".com" to their own list
                    this.domains_lists["com"].push(domain.string);
                }
            }
            else {
                // all others already sorted by listname
                this.domains_lists[listname].push(domain.string);
            }
        }
    }
    /*
     * sort each list
     */
    for (let listname in this.domains_lists) {
        let list = this.domains_lists[listname];
        // sort list of objects
        if (listname !== "tld" && listname !== "com") {
            let index_multiplier = 0.01;
            if (listname === "word hack") {
                index_multiplier = 0.005;
            }
            if (listname === "phrase hack") {
                index_multiplier = 0.001;
            }
            list = sort_strings_by_rating_and_position(list, dom_ratings, index_multiplier);
        }
        if (listname === "com") {
            list = sort_strings_by_length_and_position(list, 0.1);
        }
        // limit, convert to string
        if (listname === "word hack" || listname === "phrase hack") {
            list = list.slice(0, 100);
            list = strings_shuffle_first_last(list);
            list = strings_shuffle_last(list);
            list = list.slice(0, 50);
        }
        else {
            // list = list.slice(0, 250)
            // if (listname !== "tld" && listname !== "com") {
            //   list = strings_shuffle_first_last_strict(list)
            // }
            list = list.slice(0, 150);
        }
        // shuffle
        // if (listname === "name" || listname === "word hack") {
        //   list = strings_shuffle_last(list)
        // }
        // filter
        if (listname === "com") {
            // filter out short .coms
            list = list.filter(function (dom) {
                if (!dom)
                    return false;
                let sld = dom.substring(0, dom.indexOf(" ."));
                if (sld.length < 8 || (sld.length < 12 && !sld.includes(" "))) {
                    return false;
                }
                return true;
            });
        }
        // then convert to string
        this.domains_lists[listname] = list;
    }
    // sort ".com"s
    // this.domains_lists["com"] = sort_strings_by_length_and_position(this.domains_lists["com"], 2)
    if (DEBUG2) {
        console.log("name ___BEFORE___ SORTING");
        console.log(this.domains_lists["name"]);
    }
    /*
     *
     * ADD DASHES
     *
     */
    if (this.options.use_dashes) {
        {
            let coms = this.domains_lists["com"];
            let cn = Math.ceil(coms.length * 1);
            let wi = 0;
            for (let str of coms) {
                let arr = str.split(" .");
                if (arr[1]) {
                    if (arr[0].includes(" ")) {
                        let str_wdashes = arr[0].trim().replace(/ /g, "-");
                        this.domains_lists["com"].splice(cn, 0, str_wdashes + " ." + arr[1]);
                        dom_ratings[str_wdashes] = dom_ratings[str] || 10;
                        cn += 2;
                        wi++;
                        if (wi > 5) {
                            break;
                        }
                    }
                }
            }
        }
        {
            let tlds = this.domains_lists["tld"]; //
            let cn = Math.ceil(tlds.length * 1);
            let wi = 0;
            for (let str of tlds) {
                let arr = str.split(" .");
                if (arr[1]) {
                    if (arr[0].includes(" ")) {
                        let str_wdashes = arr[0].trim().replace(/ /g, "-");
                        this.domains_lists["tld"].splice(cn, 0, str_wdashes + " ." + arr[1]);
                        dom_ratings[str_wdashes] = dom_ratings[str] || 10;
                        cn += 2;
                        wi++;
                        if (wi > 5) {
                            break;
                        }
                    }
                }
            }
        }
    }
    // debug
    if (DEBUG2) {
        console.log("name AFTER SORTING");
        console.log(this.domains_lists["name"]);
    }
    /*
     *
     * ALL COMBINED INTO ONE LIST
     *
     */
    // let all_unique: any = { [this.string_original + " ." + this.tld]: true, [this.string + " ." + this.tld]: true }
    // let all = []
    // let ratios: any = {
    //   "exact": 1,
    //   "tld": 1,
    //   "com": 2,
    //   "name": 2,
    //   "phrase hack": 1,
    //   "word hack": 1
    // }
    // for (let ln = 1; ln < 50; ln++) {
    //   listloop: for (let listname in ratios) {
    //     if (listname === "all") continue
    //     let list = this.domains_lists[listname]
    //     if (!list) continue
    //     let ratio = ratios[listname]
    //     // from previous (which is current minus one) until current
    //     // first pass on "tld": from ((prev-1)*ratio) ((1-1)*3 = 0) until less than (current*ratio) (1*3 = 3)
    //     // secnd pass on "tld": from ((prev-1)*ratio) ((2-1)*3 = 3) until less than (current*ratio) (2*3 = 6)
    //     for (let li = (ln - 1) * ratio; li < ln * ratio; li++) {
    //       //
    //       // add each item in range
    //       let dom = list[li]
    //       if (!dom) continue //break listloop // dont bother looping through all li's - if empty, means there will be no more after
    //       if (dom === this.string_original + " ." + this.tld) continue
    //       if (dom === this.string + " ." + this.tld) continue
    //       if (all_unique[dom]) continue
    //       all.push(dom)
    //       all_unique[dom] = true
    //     }
    //   }
    // }
    // all = sort_strings_by_rating_and_position(all, all_ratings, 3)
    // all = strings_shuffle_last3_strict(all)
    // for (let dom of all) {
    //   global.cconsole.log(dom, all_ratings[dom])
    // }
    // let dom1 = this.string_original + " ." + this.tld
    // let dom2 = this.string + " ." + this.tld
    // if (dom2.replace(/ /g, "") !== dom1.replace(/ /g, "")) {
    //   all.unshift(dom1)
    //   all.unshift(dom2)
    // } else {
    //   all.unshift(dom1)
    // }
    // this.domains_lists["all"] = all
}
