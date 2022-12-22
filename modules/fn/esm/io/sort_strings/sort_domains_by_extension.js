/**
 * Used to sort a list of domain names by their domain extension - putting best ones higher in list.
 * @param domains {Array<String>} - list of domains - each string must contain at least one period "."
 * @param extensions {array} - list of extensions (domain extensions) to sort by. Best = first. Worst = last.
 * @param immutable {boolean} - Set this to `true` to make this a pure function, and immutable.
 *    By default, THIS IS NOT A PURE FUNCTION, it modifies the original array. Unless this is set to `true`.
 * @returns {array} - sorted array
 */
export default function sort_domains_by_extension(domains, extensions) {
    if (!domains || !domains.length)
        return [];
    /**
     * xRs - dictionary of extensions with the dot "R"eplaced
     */
    const xRs = {};
    for (let x of extensions) {
        xRs[x] = x.replace(".", "").toLowerCase().trim();
    }
    const dRs = domains.map((d) => {
        d.toLowerCase().trim();
        // if the ending of d matches a key of xRs, replace it with the value of xRs
        for (let x in xRs) {
            if (d.endsWith(x)) {
                return d.replace(x, xRs[x]);
            }
        }
        return d;
    });
    return dRs.sort(sort_domains_by_extension__helper.bind(Object.values(xRs)));
}
function sort_domains_by_extension__helper(a, b) {
    let a_score = this.indexOf(a.substr(a.lastIndexOf(".") + 1));
    let b_score = this.indexOf(b.substr(b.lastIndexOf(".") + 1));
    return a_score - b_score;
}
