/**
 * Test setup - runs before any test files via --import.
 * Ensures TRADING_DB_URL is set so db module does not throw during unit tests.
 * The real pool is never used when tests inject mock getStrengthRows.
 */
if (!process.env.TRADING_DB_URL) {
  process.env.TRADING_DB_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}
