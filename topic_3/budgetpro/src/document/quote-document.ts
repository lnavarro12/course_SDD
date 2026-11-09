import { formatCOP, formatQuantity } from '../domain/money'
import { formatDate } from '../domain/dates'
import { IVA_PCT, type CompleteQuote } from '../domain/types'

export interface QuoteDocument {
  title: 'PRESUPUESTO'
  number: string
  issueDate: string
  dueDate: string
  issuer: { name: string; taxId: string; email?: string; phone?: string; address?: string; logo: string | null }
  client: { name: string; typeLabel: string; taxId?: string; email?: string; phone?: string; address?: string }
  rows: { description: string; quantity: string; unitPrice: string; amount: string }[]
  summary: {
    base: string
    ivaLabel: string
    iva: string
    withholding?: { label: string; value: string }
    total: string
  }
  fileName: string
}

export function buildQuoteDocument(quote: CompleteQuote): QuoteDocument {
  if (quote.status !== 'COMPLETO') throw new Error('Solo se puede generar el documento de un presupuesto completo.')
  const isCompany = quote.client.type === 'EMPRESA'
  const logo = typeof quote.issuer.logo === 'string' && quote.issuer.logo ? quote.issuer.logo : null
  return {
    title: 'PRESUPUESTO',
    number: quote.number,
    issueDate: formatDate(quote.issueDate),
    dueDate: formatDate(quote.dueDate),
    issuer: {
      name: quote.issuer.name,
      taxId: quote.issuer.taxId,
      email: quote.issuer.email || undefined,
      phone: quote.issuer.phone || undefined,
      address: quote.issuer.address || undefined,
      logo,
    },
    client: {
      name: quote.client.name,
      typeLabel: isCompany ? 'Empresa' : 'Persona natural',
      taxId: quote.client.taxId || undefined,
      email: quote.client.email || undefined,
      phone: quote.client.phone || undefined,
      address: quote.client.address || undefined,
    },
    rows: quote.lines.map((l) => ({
      description: l.description,
      quantity: formatQuantity(l.quantityHundredths!),
      unitPrice: formatCOP(l.unitPrice!),
      amount: formatCOP(l.amount!),
    })),
    summary: {
      base: formatCOP(quote.totals.base),
      ivaLabel: `IVA (${IVA_PCT} %)`,
      iva: formatCOP(quote.totals.iva),
      withholding: isCompany
        ? {
            label: `Retención en la fuente (${quote.withholdingPctApplied} %)`,
            value: formatCOP(-quote.totals.withholding),
          }
        : undefined,
      total: formatCOP(quote.totals.total),
    },
    fileName: `PRESUPUESTO-${quote.number}.pdf`,
  }
}
