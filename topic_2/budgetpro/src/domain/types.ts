export type ClientType = 'PERSONA_NATURAL' | 'EMPRESA'
export type QuoteStatus = 'BORRADOR' | 'COMPLETO'
export type WithholdingPct = 4 | 6 | 10 | 11

export const IVA_PCT = 19
export const WITHHOLDING_OPTIONS: WithholdingPct[] = [4, 6, 10, 11]

export interface Profile {
  name: string
  taxId: string
  email?: string
  phone?: string
  address?: string
  logo?: Blob | string
}

export interface Settings {
  withholdingPct: WithholdingPct
}

export interface Client {
  id: string
  name: string
  type: ClientType
  taxId?: string
  email?: string
  phone?: string
  address?: string
}

export interface Service {
  id: string
  code: string
  codeKey: string
  description: string
  price: number
}

export interface QuoteLine {
  id: string
  description: string
  quantityHundredths: number | null
  unitPrice: number | null
  amount?: number
  sourceServiceId?: string
  sourcePriceAtAdd?: number
}

export interface Totals {
  base: number
  iva: number
  withholding: number
  total: number
}

interface QuoteCommon {
  id: string
  createdAt: string
  updatedAt: string
  lines: QuoteLine[]
}

export interface DraftQuote extends QuoteCommon {
  status: 'BORRADOR'
  clientId: string | null
}

export interface CompleteQuote extends QuoteCommon {
  status: 'COMPLETO'
  number: string
  issueDate: string
  dueDate: string
  issuer: Profile
  client: Omit<Client, 'id'> & { id?: string }
  withholdingPctApplied: 0 | 4 | 6 | 10 | 11
  totals: Totals
}

export type Quote = DraftQuote | CompleteQuote
