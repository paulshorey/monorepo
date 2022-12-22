/**
 * Get pixel width of characters in word
 * Works best with a simple word, but can do sentences, paragraphs, array of strings, numbers, etc.
 * Not perfect, only a relative general ballpark figure. Of course in reality it depends what font/size you use.
 * @param {string|number|array} str - works best with {string}, but will convert an array or number .toString()
 */
export default function word_width(str: string): number;
