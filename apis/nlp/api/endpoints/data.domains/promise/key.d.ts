/**
 * Get DB row
 * @param key {string} - domain extension
 * @param options {object}
 * @param options.parse {boolean} - default true. If false, will return content stringified, directly from database
 * @resolves row {object} - full DB row {key, rank, syns1, etc}
 */
export default function (key: any, { parse }: {
    parse?: boolean;
}): Promise<unknown>;
