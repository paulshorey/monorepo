/**************************************************************************************************
 * FUNCTIONS
 ****************************************************/
/**
 * PGDB sites.memidex: Get row column value "html"
 * @param key {string}
 * @resolves html {string}
 */
export declare const get_memidex_html: (key: any) => Promise<unknown>;
/**
 * PGDB sites.memidex: Add or Edit row
 * @param row {object} - object keys/values will be converted to SQL UPDATE string
 * @param row.key {string}
 * @param row.html {string}
 * @resolves success {boolean}
 */
export declare const set_memidex: (row: any) => Promise<unknown>;
/**
 * PGDB sites.memidex: Save row
 * @param row {object} - row object key/value pairs will be converted to SQL UPDATE string
 * @resolves success {boolean}
 */
export declare const update_memidex: (row: any) => Promise<unknown>;
