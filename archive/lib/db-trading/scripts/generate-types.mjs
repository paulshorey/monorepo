import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const connectionString = process.env.TRADING_DB_URL;
if (!connectionString) {
  throw new Error("TRADING_DB_URL is required");
}

const client = new Client({ connectionString });
await client.connect();

const columnsRes = await client.query(`
  SELECT table_name, column_name, is_nullable, data_type, udt_name, ordinal_position
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name <> 'schema_migrations_cursor'
  ORDER BY table_name, ordinal_position
`);

const enumsRes = await client.query(`
  SELECT t.typname AS enum_name, e.enumlabel AS enum_label, e.enumsortorder
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
  ORDER BY t.typname, e.enumsortorder
`);

await client.end();

const enumMap = new Map();
for (const row of enumsRes.rows) {
  if (!enumMap.has(row.enum_name)) {
    enumMap.set(row.enum_name, []);
  }
  enumMap.get(row.enum_name).push(row.enum_label);
}

const tables = new Map();
for (const row of columnsRes.rows) {
  if (!tables.has(row.table_name)) {
    tables.set(row.table_name, []);
  }
  tables.get(row.table_name).push(row);
}

const pascalCase = (value) =>
  value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

const baseTypeFromRow = (row) => {
  const udt = String(row.udt_name || "");
  const dataType = String(row.data_type || "");

  const mapSimple = (t) => {
    if (["int2", "int4", "int8", "float4", "float8", "numeric", "money"].includes(t)) return "number";
    if (["bool"].includes(t)) return "boolean";
    if (["json", "jsonb"].includes(t)) return "unknown";
    if (["date", "timestamp", "timestamptz", "time", "timetz"].includes(t)) return "Date";
    if (["uuid", "text", "varchar", "bpchar", "char", "name"].includes(t)) return "string";
    if (["bytea"].includes(t)) return "Buffer";
    if (["interval"].includes(t)) return "string";
    return "unknown";
  };

  if (enumMap.has(udt)) {
    return enumMap
      .get(udt)
      .map((v) => JSON.stringify(v))
      .join(" | ");
  }

  if (udt.startsWith("_")) {
    const element = mapSimple(udt.slice(1));
    return `Array<${element}>`;
  }

  if (dataType === "ARRAY") {
    return "unknown[]";
  }

  return mapSimple(udt);
};

let output = "";
output += "// AUTO-GENERATED FILE. DO NOT EDIT.\n";
output += "// Run: pnpm --filter @lib/db-trading db:types:generate\n\n";

if (enumMap.size > 0) {
  const enumEntries = [...enumMap.entries()];
  for (const [enumName, labels] of enumEntries) {
    const typeName = `${pascalCase(enumName)}Enum`;
    output += `export type ${typeName} = ${labels.map((v) => JSON.stringify(v)).join(" | ")};\n`;
  }
  output += "\n";
}

for (const [tableName, columns] of tables.entries()) {
  const iface = `${pascalCase(tableName)}Row`;
  output += `export interface ${iface} {\n`;
  for (const column of columns) {
    const baseType = baseTypeFromRow(column);
    const nullable = column.is_nullable === "YES" ? " | null" : "";
    output += `  ${JSON.stringify(column.column_name)}: ${baseType}${nullable};\n`;
  }
  output += "}\n\n";
}

output += "export interface PostgresDbSchema {\n";
for (const tableName of tables.keys()) {
  const iface = `${pascalCase(tableName)}Row`;
  output += `  ${JSON.stringify(tableName)}: ${iface};\n`;
}
output += "}\n";

const jsonOutput = {};
for (const [tableName, columns] of tables.entries()) {
  jsonOutput[tableName] = columns.map((c) => ({
    column: c.column_name,
    nullable: c.is_nullable === "YES",
    type: baseTypeFromRow(c),
  }));
}

const outDir = path.resolve("generated/typescript");
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "db-types.ts"), output, "utf8");

const jsonDir = path.resolve("generated/contracts");
await fs.mkdir(jsonDir, { recursive: true });
await fs.writeFile(path.join(jsonDir, "db-schema.json"), JSON.stringify(jsonOutput, null, 2), "utf8");

console.log("Wrote generated/typescript/db-types.ts");
console.log("Wrote generated/contracts/db-schema.json");
