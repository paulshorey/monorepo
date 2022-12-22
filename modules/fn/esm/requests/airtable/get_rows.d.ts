type Output = Array<Record<string, any>>;
/**
 * Get rows from Airtable table
 * REQUIRES: process.env.AIRTABLE_API_KEY and process.env.AIRTABLE_BASE
 *
 * @param opt.rec - IDK - forget what this is exactly - find record in table
 * @param opt.table {string} - name of the "base" in Airtable (*required*)
 * @param opt.columns {string} - specify any column that you want to read data from (*required*)
 * @param opt.view {string} - Default is "Grid view". Specify if different.
 * @param opt.formula {string} - Airtable "formula". Example: `{page} = "general"`.
 * @returns - list of objects. Each object is a row. Each value in the object is a cell.
 */
export default function getAirtableRows({ rec, table, columns, view, formula }: {
    rec: any;
    table: any;
    columns: any;
    view?: string | undefined;
    formula?: string | undefined;
}): Promise<Output>;
export {};
