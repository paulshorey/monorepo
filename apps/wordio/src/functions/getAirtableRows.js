import Airtable from 'airtable';

let base = new Airtable({ apiKey: 'keyk5UeM03SRs3KMl' }).base('appEMr2TfDS4kxCjf');

/**
 * Get rows from Airtable table
 * @param table {string} - name of the "base" in Airtable (*required*)
 * @param columns {string} - specify any column that you want to read data from (*required*)
 * @param view {string} - Default is "Grid view". Specify if different.
 * @param formula {string} - Airtable "formula". Example: `{page} = "general"`.
 * @returns {array} - list of objects. Each object is a row. Each value in the object is a cell.
 */
export default function getAirtableRows({ rec, table, columns, view = 'Grid view', formula = '' }) {
  return new Promise((resolve) => {
    let output = [];

    if (rec) {
      base(table).find(rec, function (err, record) {
        if (err) {
          console.error(err);
          return;
        }

        let row = {};
        for (let key of columns) {
          row[key] = record.get(key) || null;
        }
        output.push(row);
        resolve(row);
      });
      return;
    }

    base(table)
      .select({
        maxRecords: 100,
        view,
        filterByFormula: formula,
      })
      .eachPage(
        function page(records, fetchNextPage) {
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
        },
        function done(err) {
          if (err) {
            console.error(err);
          }
          resolve(output);
        }
      );
  });
}
