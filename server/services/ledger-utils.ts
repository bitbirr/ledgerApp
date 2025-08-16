// Utility helpers for ledger calculations that do not require DB access

/**
 * Check if journal lines are balanced to 2 decimal places.
 * Undefined debit/credit are treated as 0.
 */
export function isBalanced(lines: Array<{ debit?: number; credit?: number }>): boolean {
  const td = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  return Number(td.toFixed(2)) === Number(tc.toFixed(2));
}