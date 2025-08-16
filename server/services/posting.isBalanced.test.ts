import { describe, it, expect } from 'vitest';
import { isBalanced } from './ledger-utils';

describe('isBalanced()', () => {
  it('returns true for equal debits and credits (2 decimals)', () => {
    const lines = [
      { debit: 100.00, credit: 0 },
      { debit: 0, credit: 60.50 },
      { debit: 0, credit: 39.50 },
    ];
    expect(isBalanced(lines)).toBe(true);
  });

  it('returns false when not balanced', () => {
    const lines = [
      { debit: 100.00, credit: 0 },
      { debit: 0, credit: 99.99 },
    ];
    expect(isBalanced(lines)).toBe(false);
  });

  it('treats undefined as 0', () => {
    const lines = [
      { debit: 50 },
      { credit: 50 },
    ];
    expect(isBalanced(lines)).toBe(true);
  });
});