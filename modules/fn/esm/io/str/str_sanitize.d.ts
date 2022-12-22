/**
 * Sanitize a string by removing all characters except letters, numbers, and the characters specified in `allowChars`.
 * @param opt.allowChars - Default "\\\\w\\\\-_". RegEx fragment of characters to allow. Vale will be placed inside RegExp square brackets. Note: escape any backslashes with one backslash.
 * @param opt.allowUppercase - Default false. If true, will allow uppercase letters. Else will convert to lowercase.
 */
export default function str_sanitize(str: string, { allowChars, allowUppercase }?: {
    allowChars?: string | undefined;
    allowUppercase?: boolean | undefined;
}): string;
