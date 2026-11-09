import { describe, it, expect } from 'vitest'
import { roundHalfUp, formatCOP, formatQuantity, parseQuantity, parsePrice } from '../../src/domain/money'
import { calcTotals, lineAmount } from '../../src/domain/calc'
import type { QuoteLine } from '../../src/domain/types'

const L = (q: number | null, p: number | null, id = 'x'): QuoteLine => ({
  id, description: 'd', quantityHundredths: q, unitPrice: p,
})
const spec = [L(100, 350000), L(200, 60000), L(100, 200000)]

describe('money', () => {
  it('roundHalfUp', () => {
    expect(roundHalfUp(1, 2)).toBe(1)
    expect(roundHalfUp(49, 100)).toBe(0)
    expect(roundHalfUp(50, 100)).toBe(1)
  })
  it('formatos', () => {
    expect(formatCOP(1234567)).toBe('$1.234.567')
    expect(formatCOP(-73700)).toBe('-$73.700')
    expect(formatCOP(0)).toBe('$0')
    expect(formatQuantity(150)).toBe('1,5')
    expect(formatQuantity(100)).toBe('1')
    expect(formatQuantity(225)).toBe('2,25')
  })
  it('parseo', () => {
    expect(parseQuantity('abc')).toBeNull()
    expect(parseQuantity('1,555')).toBeNull()
    expect(parseQuantity('1,5')).toBe(150)
    expect(parseQuantity('2.25')).toBe(225)
    expect(parsePrice('abc')).toBeNull()
    expect(parsePrice('60000')).toBe(60000)
    expect(parsePrice('$1.234.567')).toBe(1234567)
  })
})

describe('calc', () => {
  it('ejemplo del spec', () => {
    const emp = calcTotals(spec, { type: 'EMPRESA' }, 11)
    expect(emp).toEqual({ base: 670000, iva: 127300, withholding: 73700, total: 723600 })
    expect(calcTotals(spec, { type: 'PERSONA_NATURAL' }, 11)).toEqual({
      base: 670000, iva: 127300, withholding: 0, total: 797300,
    })
    const r4 = calcTotals(spec, { type: 'EMPRESA' }, 4)
    expect(r4.withholding).toBe(26800)
    expect(r4.total).toBe(770500)
  })
  it('sin cliente', () => {
    const r = calcTotals(spec, null, 11)
    expect(r.withholding).toBeNull()
    expect(r.total).toBeNull()
    expect(r.base).toBe(670000)
  })
  it('redondeo de línea y líneas parciales', () => {
    expect(lineAmount(150, 333)).toBe(500) // 499,5 -> 500
    expect(calcTotals([L(null, 1000), L(100, null), L(100, 500)], null, 11).base).toBe(500)
    expect(calcTotals([L(100, 0)], null, 11).base).toBe(0)
  })
})
