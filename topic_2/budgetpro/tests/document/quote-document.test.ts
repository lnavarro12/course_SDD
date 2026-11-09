import { describe, it, expect } from 'vitest'
import { buildQuoteDocument } from '../../src/document/quote-document'
import type { CompleteQuote } from '../../src/domain/types'

const base = (o: Partial<CompleteQuote> = {}): CompleteQuote => ({
  id: 'q', status: 'COMPLETO', createdAt: 'x', updatedAt: 'x',
  number: '2026-001', issueDate: '2026-11-09', dueDate: '2026-12-09',
  issuer: { name: 'Ana', taxId: '123', logo: 'data:image/png;base64,AAA' },
  client: { name: 'Acme', type: 'EMPRESA', taxId: '900' },
  withholdingPctApplied: 11,
  totals: { base: 670000, iva: 127300, withholding: 73700, total: 723600 },
  lines: [
    { id: 'a', description: 'Diseño de pañuelos y señalización', quantityHundredths: 150, unitPrice: 100000, amount: 150000 },
  ],
  ...o,
})

describe('buildQuoteDocument', () => {
  it('contenido completo (empresa)', () => {
    const d = buildQuoteDocument(base())
    expect(d.title).toBe('PRESUPUESTO')
    expect(d.number).toBe('2026-001')
    expect(d.issueDate).toBe('09/11/2026')
    expect(d.dueDate).toBe('09/12/2026')
    expect(d.client.typeLabel).toBe('Empresa')
    expect(d.rows).toEqual([{ description: 'Diseño de pañuelos y señalización', quantity: '1,5', unitPrice: '$100.000', amount: '$150.000' }])
    expect(d.summary.base).toBe('$670.000')
    expect(d.summary.ivaLabel).toBe('IVA (19 %)')
    expect(d.summary.withholding?.label).toBe('Retención en la fuente (11 %)')
    expect(d.summary.total).toBe('$723.600')
    expect(d.fileName).toBe('PRESUPUESTO-2026-001.pdf')
    expect(JSON.stringify(d).toLowerCase()).not.toContain('factura')
    expect(JSON.stringify(d)).not.toContain('codigo')
  })
  it('persona natural sin retención; sin logo', () => {
    const d = buildQuoteDocument(base({
      client: { name: 'Luis', type: 'PERSONA_NATURAL' }, withholdingPctApplied: 0,
      issuer: { name: 'Ana', taxId: '1' },
    }))
    expect(d.summary.withholding).toBeUndefined()
    expect(d.client.typeLabel).toBe('Persona natural')
    expect(d.issuer.logo).toBeNull()
  })
  it('lanza con un borrador', () => {
    expect(() => buildQuoteDocument({ id: 'd', status: 'BORRADOR', clientId: null, lines: [], createdAt: '', updatedAt: '' } as never)).toThrow()
  })
})
