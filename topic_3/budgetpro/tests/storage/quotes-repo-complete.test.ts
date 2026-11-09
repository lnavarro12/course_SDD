import { describe, it, expect, beforeEach } from 'vitest'
import { completeQuote, saveDraft, deleteDraft, getQuote } from '../../src/storage/quotes-repo'
import { saveProfile, saveSettings } from '../../src/storage/profile-repo'
import { saveClient } from '../../src/storage/clients-repo'
import { getDb } from '../../src/storage/db'
import { freshDb } from './helpers'
import type { DraftQuote } from '../../src/domain/types'

const NOW = new Date('2026-11-09T15:00:00-05:00')

beforeEach(async () => {
  await freshDb()
  await saveProfile({ name: 'Ana Diseño', taxId: '123', logo: 'data:image/png;base64,AAA' })
  await saveClient({ id: 'emp', name: 'Acme', type: 'EMPRESA', taxId: '900' })
  await saveClient({ id: 'per', name: 'Luis', type: 'PERSONA_NATURAL' })
})

const draft = (o: Partial<DraftQuote> = {}): DraftQuote => ({
  id: 'q1', status: 'BORRADOR', clientId: 'emp', createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '',
  lines: [
    { id: 'a', description: 'Logo', quantityHundredths: 100, unitPrice: 350000, sourceServiceId: 's' },
    { id: 'b', description: 'Pañuelos', quantityHundredths: 200, unitPrice: 60000 },
    { id: 'c', description: 'Señalización', quantityHundredths: 100, unitPrice: 200000 },
  ], ...o,
})
const counter = async (y = 2026) => (await getDb()).get('counters', y)

describe('completeQuote', () => {
  it('ejemplo del spec (empresa 11 %)', async () => {
    const q = await completeQuote(draft(), { now: NOW })
    expect(q.status).toBe('COMPLETO')
    expect(q.number).toBe('2026-001')
    expect(q.issueDate).toBe('2026-11-09')
    expect(q.dueDate).toBe('2026-12-09')
    expect(q.withholdingPctApplied).toBe(11)
    expect(q.totals).toEqual({ base: 670000, iva: 127300, withholding: 73700, total: 723600 })
    expect(q.lines.map((l) => l.amount)).toEqual([350000, 120000, 200000])
    expect(q.issuer.logo).toBe('data:image/png;base64,AAA')
    expect(q.client.name).toBe('Acme')
    expect((q.lines[0] as any).sourceServiceId).toBeUndefined()
    expect((q as any).clientId).toBeUndefined()
  })
  it('persona natural: retención 0', async () => {
    const q = await completeQuote(draft({ clientId: 'per' }), { now: NOW })
    expect(q.withholdingPctApplied).toBe(0)
    expect(q.totals.total).toBe(797300)
  })
  it('numeración consecutiva y año nuevo', async () => {
    const nums = []
    for (let i = 0; i < 3; i++) nums.push((await completeQuote(draft({ id: 'q' + i }), { now: NOW })).number)
    expect(nums).toEqual(['2026-001', '2026-002', '2026-003'])
    const n = await completeQuote(draft({ id: 'z' }), { now: new Date('2027-01-02T10:00:00-05:00') })
    expect(n.number).toBe('2027-001')
  })
  it('validaciones fallidas no cambian nada', async () => {
    await expect(completeQuote(draft({ clientId: null }), { now: NOW })).rejects.toThrow('Selecciona un cliente.')
    await expect(completeQuote(draft({ lines: [] }), { now: NOW })).rejects.toThrow('Agrega al menos una línea.')
    await expect(
      completeQuote(draft({ lines: [{ id: 'x', description: '', quantityHundredths: 0, unitPrice: -1 }] }), { now: NOW }),
    ).rejects.toThrow(/línea 1/)
    await saveProfile({ name: 'A', taxId: 'B' })
    const db = await getDb()
    await db.put('profile', { name: '', taxId: '' }, 'main')
    await expect(completeQuote(draft(), { now: NOW })).rejects.toThrow('Completa tu nombre y NIT/CC en Perfil.')
    expect(await counter()).toBeUndefined()
    expect(await getQuote('q1')).toBeNull()
  })
  it('atomicidad: fallo antes de confirmar (SC-017)', async () => {
    await saveDraft(draft())
    const before = await getQuote('q1')
    await expect(
      completeQuote(draft(), { now: NOW, hooks: { beforeCommit: () => { throw new Error('fallo simulado') } } }),
    ).rejects.toThrow()
    expect(await getQuote('q1')).toEqual(before)
    expect(await counter()).toBeUndefined()
    expect((await completeQuote(draft(), { now: NOW })).number).toBe('2026-001')
  })
  it('presupuesto nuevo: fallo no crea registro; éxito deja uno solo', async () => {
    await expect(
      completeQuote(draft({ id: 'nuevo' }), { now: NOW, hooks: { beforeCommit: () => { throw new Error('x') } } }),
    ).rejects.toThrow()
    expect(await getQuote('nuevo')).toBeNull()
    await completeQuote(draft({ id: 'nuevo' }), { now: NOW })
    const db = await getDb()
    expect(await db.count('quotes')).toBe(1)
    expect(await counter()).toBe(1)
  })
  it('COMPLETO es final', async () => {
    await completeQuote(draft(), { now: NOW })
    await expect(saveDraft(draft())).rejects.toThrow()
    await expect(completeQuote(draft(), { now: NOW })).rejects.toThrow()
    await expect(deleteDraft('q1')).rejects.toThrow()
    expect(await counter()).toBe(1)
  })
  it('cambios posteriores no alteran el COMPLETO (SC-009)', async () => {
    const q = await completeQuote(draft(), { now: NOW })
    await saveProfile({ name: 'Otro', taxId: '999' })
    await saveClient({ id: 'emp', name: 'Renombrado', type: 'PERSONA_NATURAL' })
    await saveSettings({ withholdingPct: 4 })
    expect(await getQuote('q1')).toEqual(q)
  })
  it('número con 4 dígitos tras 999', async () => {
    const db = await getDb()
    await db.put('counters', 999, 2026)
    expect((await completeQuote(draft(), { now: NOW })).number).toBe('2026-1000')
  })
})
