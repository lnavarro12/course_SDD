import { roundHalfUp } from './money'
import { IVA_PCT, type Client, type QuoteLine, type WithholdingPct } from './types'

export function lineAmount(qtyHundredths: number, price: number): number {
  return roundHalfUp(qtyHundredths * price, 100)
}

export function isLineCalculable(line: Pick<QuoteLine, 'quantityHundredths' | 'unitPrice'>): boolean {
  return (
    line.quantityHundredths != null &&
    line.unitPrice != null &&
    line.quantityHundredths > 0 &&
    line.unitPrice >= 0
  )
}

export interface CalcResult {
  base: number
  iva: number
  withholding: number | null
  total: number | null
}

export function calcTotals(
  lines: QuoteLine[],
  client: Pick<Client, 'type'> | null,
  withholdingPct: WithholdingPct | number,
): CalcResult {
  let base = 0
  for (const l of lines) {
    if (isLineCalculable(l)) base += lineAmount(l.quantityHundredths!, l.unitPrice!)
  }
  const iva = roundHalfUp(base * IVA_PCT, 100)
  if (!client) return { base, iva, withholding: null, total: null }
  const withholding = client.type === 'EMPRESA' ? roundHalfUp(base * withholdingPct, 100) : 0
  return { base, iva, withholding, total: base + iva - withholding }
}
