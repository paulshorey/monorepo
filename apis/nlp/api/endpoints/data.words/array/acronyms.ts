const acronyms_tuple = require('api/data.words/array/acronyms_tuples.js');
// convert to set
const acronyms = new Set();
// assuming all in correct format:
for (let tuple of acronyms_tuple) {
	acronyms.add(tuple[0]);
}

// convert to list (array)
module.exports = [...acronyms];
