// import generic_tlds from "@ps/nlp/data/domains/mixins/generic"
export default function () {
    /*
     *
     * domains['tld']
     *
     */
    // add new domain for each tld
    for (let tld of this.tlds_with_generic) {
        // words = words.filter(w => w !== tld)
        let str = this.string_original;
        // cut out tld from str
        if (str.substr(-tld.length) === tld) {
            str = str.substring(0, str.length - tld.length);
            if (str[str.length - 1] === "-" || str[str.length - 1] === " ") {
                str = str.substring(0, str.length - 1);
            }
        }
        // if (tld === words[words.length - 1]) continue
        // validate
        str = str.trim();
        if (!str)
            continue;
        // construct domain
        let domain = {
            words: [str],
            tld: tld,
            list: "tld",
            string: str + " ." + tld,
            rating: 100000
        };
        // save domain
        if (!this.domains_dict[domain.string]) {
            this.domains_dict[domain.string] = domain;
        }
    }
}
