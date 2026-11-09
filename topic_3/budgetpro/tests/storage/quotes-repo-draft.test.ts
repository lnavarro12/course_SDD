import { describe, it, expect, beforeEach } from 'vitest'
import { saveDraft, deleteDraft, getQuote } from '../../src/storage/quotes-repo'
import { getDb } from '../../src/storage/db'
import { freshDb } from './helpers'
import type { DraftQuote } from '../../src/domain/types'

beforeEach(freshDb)
const D = (o: Partial<DraftQuote> = {}): DraftQuote => ({
  id: 'd1', status: 'BORRADOR', clientId: null, lines: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '', ...o,
})

describe('saveDraft', () => {
  it('guarda un presupuesto vacío sin número ni fechas', async () => {
    await saveDraft(D())
    const q: any = await getQuote('d1')
    expect(q.status).toBe('BORRADOR')
    expect(q.number).toBeUndefined()
    expect(q.issueDate).toBeUndefined()
    expect(q.dueDate).toBeUndefined()
  })
  it('guarda líneas parciales y rechaza no numéricos', async () => {
    await saveDraft(D({ lines: [{ id: 'l', description: '', quantityHundredths: null, unitPrice: 5 }] }))
    await expect(
      saveDraft(D({ lines: [{ id: 'l', description: '', quantityHundredths: NaN, unitPrice: 5 }] })),
    ).rejects.toThrow('La cantidad debe ser un número.')
    await expect(
      saveDraft(D({ lines: [{ id: 'l', description: '', quantityHundredths: 1, unitPrice: NaN }] })),
    ).rejects.toThrow('El precio debe ser un número.')
  })
  it('actualiza updatedAt en cada guardado', async () => {
    const a = await saveDraft(D(), { now: new Date('2026-02-01T00:00:00Z') })
    const b = await saveDraft(D(), { now: new Date('2026-02-02T00:00:00Z') })
    expect(a.updatedAt).not.toBe(b.updatedAt)
  })
  it('rechaza guardar sobre un COMPLETO', async () => {
    const db = await getDb()
    await db.put('quotes', { id: 'd1', status: 'COMPLETO', number: '2026-001', lines: [], createdAt: 'x', updatedAt: 'x' })
    await expect(saveDraft(D())).rejects.toThrow()
    expect(((await getQuote('d1')) as any).status).toBe('COMPLETO')
  })
  it('no toca counters al guardar ni eliminar borradores', async () => {
    for (let i = 0; i < 5; i++) await saveDraft(D({ id: 'd' + i }))
    const db = await getDb()
    expect(await db.count('counters')).toBe(0)
    await deleteDraft('d0')
    expect(await getQuote('d0')).toBeNull()
    expect(await db.count('counters')).toBe(0)
  })
  it('deleteDraft rechaza COMPLETO', async () => {
    const db = await getDb()
    await db.put('quotes', { id: 'k', status: 'COMPLETO', lines: [], createdAt: 'x', updatedAt: 'x' })
    await expect(deleteDraft('k')).rejects.toThrow()
    expect(await getQuote('k')).not.toBeNull()
  })
})
