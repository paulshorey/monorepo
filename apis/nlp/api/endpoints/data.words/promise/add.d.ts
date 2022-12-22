/**
 * Get DB row, add domains
 * @params key {string} - keyword string
 * @resolves {object} row - DB row {key, pos1, root, etc}
 */
declare const thisModule: (key: any, pos?: string, synonyms?: any[]) => Promise<unknown>;
export default thisModule;
