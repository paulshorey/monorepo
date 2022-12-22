/**
 * Sort function for [].sort()
 * by "width" ASC, considering typographic width of individual characters
 * @param a {string}
 * @param b {string}
 * @returns {number}
 */
module.exports.sortByLengthAsc = function (a, b) {
	let a_length = a.length + plusLength(a);
	let b_length = b.length + plusLength(b);
	return a_length - b_length;
};

// helper for sortByLengthAsc...
function plusLength(word) {
	if (word.includes('w') || word.includes('oze') || word.includes('ch')) {
		return 0.5;
	}
	return 0;
}
