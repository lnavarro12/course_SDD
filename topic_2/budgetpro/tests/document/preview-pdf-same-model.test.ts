import { describe, it, expect } from 'vitest'
import { buildQuoteDocument } from '../../src/document/quote-document'
import { renderPreviewRows } from '../../src/document/preview'
import { buildPdfDefinition } from '../../src/document/pdf'
import type { CompleteQuote } from '../../src/domain/types'

const q: CompleteQuote = {
  id: 'q', status: 'COMPLETO', createdAt: 'x', updatedAt: 'x', number: '2026-002',
  issueDate: '2026-11-09', dueDate: '2026-12-09',
  issuer: { name: 'Ana', taxId: '1' }, client: { name: 'Acme', type: 'EMPRESA', taxId: '9' },
  withholdingPctApplied: 11, totals: { base: 300, iva: 57, withholding: 33, total: 324 },
  lines: [
    { id: 'a', description: 'Uno', quantityHundredths: 100, unitPrice: 100, amount: 100 },
    { id: 'b', description: 'Dos '.repeat(60), quantityHundredths: 200, unitPrice: 100, amount: 200 },
  ],
}

describe('vista previa y PDF usan el mismo modelo', () => {
  const doc = buildQuoteDocument(q)
  const theme = { primary: '#1f4e79', text: '#1d2733', muted: '#5d6b7a', line: '#d5dbe1', fill: '#e8f0f7' }
  const def: any = buildPdfDefinition(doc, theme)
  const table = def.content.find((c: any) => c.table?.headerRows === 1)

  it('filas coinciden una a una', () => {
    const preview = renderPreviewRows(doc)
    const pdfRows = table.table.body.slice(1).map((r: any[]) => r.map((c) => c.text))
    expect(pdfRows).toEqual(preview)
  })
  it('encabezado repetido y filas sin partir', () => {
    expect(table.table.headerRows).toBe(1)
    expect(table.table.dontBreakRows).toBe(true)
  })
  it('totales del PDF coinciden con el modelo', () => {
    const text = JSON.stringify(def)
    expect(text).toContain(doc.summary.total)
    expect(text).toContain(doc.summary.withholding!.value)
  })
})
