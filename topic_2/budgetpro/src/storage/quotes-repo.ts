import { getDb, newId } from './db'
import { ValidationError } from '../domain/errors'
import { M } from '../app/messages'
import { calcTotals, lineAmount } from '../domain/calc'
import { addDays, todayInBogota, yearOf } from '../domain/dates'
import { validateDraftNumbers, validateForCompletion } from '../domain/quote-rules'
import type { Client, CompleteQuote, DraftQuote, Profile, Quote, Settings } from '../domain/types'

export { newId }

export async function listQuotes(): Promise<Quote[]> {
  const db = await getDb()
  const all = (await db.getAll('quotes')) as Quote[]
  return all.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
}

export async function getQuote(id: string): Promise<Quote | null> {
  const db = await getDb()
  return ((await db.get('quotes', id)) as Quote | undefined) ?? null
}

export async function saveDraft(quote: DraftQuote, opts: { now?: Date } = {}): Promise<DraftQuote> {
  const errors = validateDraftNumbers(quote.lines)
  if (errors.length) throw new ValidationError(errors)
  const db = await getDb()
  const tx = db.transaction('quotes', 'readwrite')
  const existing = (await tx.store.get(quote.id)) as Quote | undefined
  if (existing && existing.status !== 'BORRADOR') {
    tx.abort()
    await tx.done.catch(() => {})
    throw new ValidationError('Un presupuesto completo no se puede modificar.')
  }
  const nowIso = (opts.now ?? new Date()).toISOString()
  const saved: DraftQuote = {
    id: quote.id,
    status: 'BORRADOR',
    clientId: quote.clientId ?? null,
    lines: quote.lines,
    createdAt: existing?.createdAt ?? quote.createdAt ?? nowIso,
    updatedAt: nowIso,
  }
  await tx.store.put(saved)
  await tx.done
  return saved
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('quotes', 'readwrite')
  const existing = (await tx.store.get(id)) as Quote | undefined
  if (existing && existing.status !== 'BORRADOR') {
    tx.abort()
    await tx.done.catch(() => {})
    throw new ValidationError('Un presupuesto completo no se puede eliminar.')
  }
  await tx.store.delete(id)
  await tx.done
}

export interface CompleteOptions {
  now?: Date
  hooks?: { beforeCommit?: () => void }
}

export async function completeQuote(draft: DraftQuote, opts: CompleteOptions = {}): Promise<CompleteQuote> {
  const numErrors = validateDraftNumbers(draft.lines)
  if (numErrors.length) throw new ValidationError(numErrors)

  const db = await getDb()
  const tx = db.transaction(['quotes', 'counters', 'clients', 'profile', 'settings'], 'readwrite')
  try {
    const existing = (await tx.objectStore('quotes').get(draft.id)) as Quote | undefined
    if (existing && existing.status !== 'BORRADOR')
      throw new ValidationError('Un presupuesto completo no se puede modificar.')

    const client = draft.clientId
      ? (((await tx.objectStore('clients').get(draft.clientId)) as Client | undefined) ?? null)
      : null
    const profile = ((await tx.objectStore('profile').get('main')) as Profile | undefined) ?? null
    const settings = ((await tx.objectStore('settings').get('main')) as Settings | undefined) ?? {
      withholdingPct: 11,
    }

    const errors = validateForCompletion(draft, client, profile)
    if (errors.length) throw new ValidationError(errors)

    const now = opts.now ?? new Date()
    const issueDate = todayInBogota(now)
    const year = yearOf(issueDate)
    const counters = tx.objectStore('counters')
    const n = (((await counters.get(year)) as number | undefined) ?? 0) + 1
    await counters.put(n, year)

    const t = calcTotals(draft.lines, client!, settings.withholdingPct)
    const isCompany = client!.type === 'EMPRESA'
    const complete: CompleteQuote = {
      id: draft.id,
      status: 'COMPLETO',
      createdAt: existing?.createdAt ?? draft.createdAt,
      updatedAt: now.toISOString(),
      number: `${year}-${String(n).padStart(3, '0')}`,
      issueDate,
      dueDate: addDays(issueDate, 30),
      issuer: { ...profile! },
      client: { name: client!.name, type: client!.type, taxId: client!.taxId, email: client!.email, phone: client!.phone, address: client!.address },
      withholdingPctApplied: isCompany ? settings.withholdingPct : 0,
      totals: { base: t.base, iva: t.iva, withholding: t.withholding ?? 0, total: t.total ?? 0 },
      lines: draft.lines.map((l) => ({
        id: l.id,
        description: l.description.trim(),
        quantityHundredths: l.quantityHundredths,
        unitPrice: l.unitPrice,
        amount: lineAmount(l.quantityHundredths!, l.unitPrice!),
      })),
    }
    await tx.objectStore('quotes').put(complete)
    opts.hooks?.beforeCommit?.()
    await tx.done
    return complete
  } catch (err) {
    try {
      tx.abort()
    } catch {
      /* ya finalizada */
    }
    await tx.done.catch(() => {})
    if (err instanceof ValidationError) throw err
    throw new Error(M.completeStorageError)
  }
}
