export default function (word, pos) {
	const suffix = {};
	suffix.nouns = [
		"eer",
		"er",
		"ion",
		"ity",
		"ment",
		"ness",
		"or",
		"sion",
		"ship",
		"th",
		"s",
		"es",
	];
	suffix.adjectives = [
		"able",
		"ible",
		"al",
		"ant",
		"ary",
		"ful",
		"ic",
		"ious",
		"ous",
		"ive",
		"less",
		"y",
	];
	suffix.verbs = [
		"ed",
		"en",
		"er",
		"ing",
		"ize",
		"ise",
		"s",
		"es",
	];
	suffix.adverbs = [
		"ly",
		"ward",
		"wise",
	];

	return word;
};
