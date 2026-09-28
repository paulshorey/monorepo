/**
 * Symbol Utilities
 *
 * Functions for parsing futures contract symbols and extracting ticker information.
 */

/** Futures month codes: F(Jan), G(Feb), H(Mar), J(Apr), K(May), M(Jun), N(Jul), Q(Aug), U(Sep), V(Oct), X(Nov), Z(Dec) */
const FUTURES_MONTH_CODES = "FGHJKMNQUVXZ";

/** Regex to extract ticker from futures symbol (e.g., ESH5 -> ES) */
const FUTURES_SYMBOL_REGEX = new RegExp(`^([A-Z]{1,3})[${FUTURES_MONTH_CODES}]\\d+$`);

/**
 * Extract parent ticker from contract symbol
 *
 * Examples:
 * - ESH5 -> ES (E-mini S&P 500, March 2025)
 * - NQM5 -> NQ (E-mini Nasdaq, June 2025)
 * - CLZ4 -> CL (Crude Oil, December 2024)
 * - GCG5 -> GC (Gold, February 2025)
 *
 * @param symbol - Contract symbol (e.g., "ESH5")
 * @returns Parent ticker (e.g., "ES") or original symbol if pattern doesn't match
 */
export function extractTicker(symbol: string | undefined): string {
  if (!symbol) {
    return "UNKNOWN";
  }
  const match = symbol.match(FUTURES_SYMBOL_REGEX);
  return match ? match[1] : symbol;
}
