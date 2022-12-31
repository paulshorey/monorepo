const DEBUG1 = false
export const makeSQLString = function (primaryKey, row, table) {
  // Assemble SQL "WHERE" string,
  // but first, format and escape each value
  let queryId = row[primaryKey].replace(/[']+/g, "''")
  let querySet = ""
  let queryKeys = ""
  let queryValues = ""
  for (let col in row) {
    // assemble the col='value' pairs
    let value = row[col]
    // value types allowed: number (no mod), string (escape), object (stringify+escape), undefined (null)
    if (typeof value === "number") {
      // number
    } else if (typeof value === "boolean") {
      // boolean
    } else if (typeof value === "object") {
      if (value === null) {
        // if null, keep value null with no quotes
      } else {
        // object, array
        value = "e'" + JSON.stringify(value).replace(/[']+/g, "''") + "'"
        // temporary, debug: add line breaks, for readibility
        value = value.replace(/,{/g, ",\n\n{")
      }
    } else if (typeof value === "undefined") {
      // undefined = do not change in DB
      delete row[col]
      continue
    } else if (typeof value === "string") {
      // string
      // replace backslash with double-backslash
      // if already double, it will stay doubled
      value = "e'" + value.replace(/[']+/g, "''").replace(/[\\]+/g, "\\\\") + "'" //.substring(0, 100)
    } else {
      // accidentally passed function or other unexpected type
      value = "e'" + value.toString().replace(/[']+/g, "''") + "'"
    }
    // record value
    querySet += `, ${col}=${value}`
    queryKeys += `, ${col}`
    queryValues += `, ${value}`
  }
  // chop off the extra delimeter ", "
  querySet = querySet.substr(2).replace(/ +/g, " ")
  queryKeys = queryKeys.substr(2).replace(/ +/g, " ")
  queryValues = queryValues.substr(2).replace(/ +/g, " ")
  //
  // Execute SQL
  let sql_update = `UPDATE ${table} SET ${querySet} WHERE ${primaryKey}=e'${queryId}';`
  let sql_insert = `INSERT INTO ${table} (${queryKeys}) SELECT ${queryValues} WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE ${primaryKey}=e'${queryId}');`
  if (DEBUG1) global.cconsole.log("sql_update", sql_update)
  if (DEBUG1) global.cconsole.log("sql_insert", sql_insert)
  return sql_update + "\n" + sql_insert
}
