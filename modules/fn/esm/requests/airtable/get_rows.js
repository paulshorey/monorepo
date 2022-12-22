import Airtable from "airtable";
let base = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE
    ? new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)
    : undefined;
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
export default function getAirtableRows({ rec, table, columns, view = "Grid view", formula = "" }) {
    return new Promise((resolve) => {
        let output = [];
        if (!base) {
            console.error("Airtable API key or base not set");
            return;
        }
        if (rec) {
            base(table).find(rec, function (err, record) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!record) {
                    console.error("no record found");
                    return;
                }
                let row = {};
                for (let key of columns) {
                    row[key] = record.get(key) || null;
                }
                output.push(row);
                resolve([row]);
            });
            return;
        }
        base(table)
            .select({
            maxRecords: 100,
            view,
            filterByFormula: formula
        })
            .eachPage(function page(records, fetchNextPage) {
            // each cell in row
            records.forEach(function (record) {
                let row = {};
                for (let key of columns) {
                    row[key] = record.get(key) || null;
                }
                output.push(row);
            });
            // next row
            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error(err);
            }
            resolve(output);
        });
    });
}
