import { describe, it, expect, beforeEach } from 'vitest'
import { saveClient, findByTaxId, deleteClient, getClient } from '../../src/storage/clients-repo'
import { getDb } from '../../src/storage/db'
import { freshDb } from './helpers'
import type { Client } from '../../src/domain/types'

beforeEach(freshDb)
const C = (o: Partial<Client> = {}): Client => ({ id: 'c1', name: 'Acme', type: 'EMPRESA', taxId: '900', ...o })

describe('clients-repo', () => {
  it('validaciones', async () => {
    await expect(saveClient(C({ taxId: '' }))).rejects.toThrow('El NIT/CC es obligatorio para empresas.')
    await saveClient(C({ id: 'p', type: 'PERSONA_NATURAL', taxId: undefined }))
    await expect(saveClient(C({ name: '' }))).rejects.toThrow(/nombre/)
    await expect(saveClient(C({ type: undefined as never }))).rejects.toThrow(/tipo/)
  })
  it('findByTaxId detecta duplicado y no impide guardar', async () => {
    await saveClient(C())
    expect(await findByTaxId('900', 'c1')).toBeNull()
    expect((await findByTaxId(' 900 '))?.id).toBe('c1')
    await saveClient(C({ id: 'c2', name: 'Otro' }))
    expect(await getClient('c2')).not.toBeNull()
  })
  it('deleteClient limpia borradores y respeta completos', async () => {
    await saveClient(C())
    const db = await getDb()
    await db.put('quotes', { id: 'd', status: 'BORRADOR', clientId: 'c1', lines: [], createdAt: 'x', updatedAt: 'x' })
    const complete = { id: 'k', status: 'COMPLETO', number: '2026-001', client: { name: 'Acme' }, lines: [], createdAt: 'x', updatedAt: 'x' }
    await db.put('quotes', complete)
    await deleteClient('c1')
    expect(await getClient('c1')).toBeNull()
    expect((await db.get('quotes', 'd')).clientId).toBeNull()
    expect(await db.get('quotes', 'k')).toEqual(complete)
  })
})
