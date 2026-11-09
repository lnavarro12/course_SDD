import { describe, it, expect } from 'vitest'
import { todayInBogota, addDays, formatDate } from '../../src/domain/dates'
import { validateForCompletion, validateDraftNumbers } from '../../src/domain/quote-rules'
import type { Client, QuoteLine } from '../../src/domain/types'

const line = (o: Partial<QuoteLine> = {}): QuoteLine => ({
  id: '1', description: 'x', quantityHundredths: 100, unitPrice: 10, ...o,
})
const client: Client = { id: 'c', name: 'A', type: 'EMPRESA', taxId: '1' }
const profile = { name: 'Yo', taxId: '9' }

describe('dates', () => {
  it('todayInBogota', () => {
    expect(todayInBogota(new Date('2026-12-31T23:30:00-05:00'))).toBe('2026-12-31')
    expect(todayInBogota(new Date('2027-01-01T04:30:00Z'))).toBe('2026-12-31')
  })
  it('addDays y formatDate', () => {
    expect(addDays('2026-11-09', 30)).toBe('2026-12-09')
    expect(formatDate('2026-11-09')).toBe('09/11/2026')
  })
})

describe('reglas', () => {
  it('sin cliente ni líneas ni perfil', () => {
    expect(validateForCompletion({ lines: [] }, null, null)).toEqual([
      'Selecciona un cliente.',
      'Agrega al menos una línea.',
      'Completa tu nombre y NIT/CC en Perfil.',
    ])
  })
  it('errores por línea con numeración desde 1', () => {
    const errs = validateForCompletion(
      { lines: [line(), line({ description: ' ' }), line({ quantityHundredths: 0 }), line({ unitPrice: -1 })] },
      client, profile,
    )
    expect(errs).toEqual([
      'La línea 2 necesita una descripción.',
      'La cantidad de la línea 3 debe ser mayor que cero.',
      'El precio de la línea 4 no puede ser negativo.',
    ])
  })
  it('todo bien', () => {
    expect(validateForCompletion({ lines: [line()] }, client, profile)).toEqual([])
  })
  it('borrador con no numéricos', () => {
    expect(validateDraftNumbers([line({ quantityHundredths: NaN })])).toEqual(['La cantidad debe ser un número.'])
    expect(validateDraftNumbers([line({ unitPrice: NaN })])).toEqual(['El precio debe ser un número.'])
    expect(validateDraftNumbers([line({ unitPrice: null, quantityHundredths: null })])).toEqual([])
  })
})
