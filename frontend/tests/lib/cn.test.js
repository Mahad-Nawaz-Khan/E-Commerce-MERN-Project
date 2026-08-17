import { describe, it, expect } from 'vitest'
import { cn } from '../../src/lib/cn'

describe('cn', () => {
  it('joins plain classes', () => { expect(cn('a', 'b')).toBe('a b') })
  it('handles conditionals', () => { expect(cn('base', { active: true, hidden: false })).toBe('base active') })
  it('merges conflicts (later wins)', () => { expect(cn('p-2', 'p-4')).toBe('p-4') })
  it('keeps non-conflicting', () => { expect(cn('text-red-500', 'font-bold')).toBe('text-red-500 font-bold') })
  it('ignores falsy', () => { expect(cn('x', false, null, undefined, '')).toBe('x') })
})
